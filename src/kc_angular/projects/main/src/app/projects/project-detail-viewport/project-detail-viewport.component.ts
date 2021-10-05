/**
 Copyright 2021 Rob Royce

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */


import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from "rxjs";
import {ProjectModel, ProjectUpdateRequest} from "projects/ks-lib/src/lib/models/project.model";
import {ProjectService} from "../../../../../ks-lib/src/lib/services/projects/project.service";
import {KnowledgeSource} from "../../../../../ks-lib/src/lib/models/knowledge.source.model";
import {KsQueueService} from "../../knowledge-source/ks-queue-service/ks-queue.service";
import {KcDialogRequest, KcDialogService} from "../../../../../ks-lib/src/lib/services/dialog/kc-dialog.service";
import {MatDialog} from "@angular/material/dialog";
import {FileUploadComponent} from "../../ingest/files/file-upload/file-upload.component";


@Component({
  selector: 'app-project-detail-viewport',
  templateUrl: './project-detail-viewport.component.html',
  styleUrls: ['./project-detail-viewport.component.scss'],
})
export class ProjectDetailViewportComponent implements OnInit, OnDestroy {
  kcProject: ProjectModel | null = null;

  ksQueue: KnowledgeSource[] = [];

  private ksQueueSubscription: Subscription;

  private kcProjectSubscription: Subscription;

  constructor(private projectService: ProjectService,
              private ksQueueService: KsQueueService,
              private confirmDialog: KcDialogService,
              private dialog: MatDialog) {
    this.ksQueueSubscription = ksQueueService.ksQueue.subscribe((ksQueue) => {
      this.ksQueue = ksQueue;
    })
    this.kcProjectSubscription = this.projectService.currentProject.subscribe(project => {
      if (project.id.value.trim() !== '')
        this.kcProject = project;
      else
        this.kcProject = null;
    });
  }

  addFile = () => {
    this.dialog.open(FileUploadComponent);
  }

  addLink = () => {
    console.log('Add a link...');
  }

  topicSearch = () => {
    console.log('Topic search...');
  }

  search = () => {
    console.log('Search...');
  }

  ksFabActions: { icon: string, label: string, click: () => void }[] = [
    {
      icon: 'description',
      label: 'Add files',
      click: this.addFile
    },
    {
      icon: 'web',
      label: 'Add a link',
      click: this.addLink
    },
    {
      icon: 'topic',
      label: 'Topic search',
      click: this.topicSearch
    },
    {
      icon: 'travel_explore',
      label: 'Search the web',
      click: this.search
    }
  ]

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.ksQueueSubscription.unsubscribe();
    this.kcProjectSubscription.unsubscribe();
  }

  ksImported($event: KnowledgeSource[]) {
    // Timeout used to give other components the chance to finish animations (i.e. don't force a bottleneck)
    setTimeout(() => {
      if (!this.kcProject) {
        return;
      }
      let update: ProjectUpdateRequest = {
        addKnowledgeSource: $event,
        id: this.kcProject.id
      }
      this.projectService.updateProject(update);
    }, 1000);
  }

  ksQueueCleared() {
    this.ksQueueService.clearResults();
  }

  ksRemoved($event: KnowledgeSource) {
    if (!this.kcProject) {
      return;
    }
    let dialogReq: KcDialogRequest = {
      actionButtonText: "Remove Source",
      actionToTake: 'delete',
      cancelButtonText: "Cancel",
      listToDisplay: [$event],
      message: "Are you sure you want to remove this knowledge source?",
      title: "Delete Source"
    }
    this.confirmDialog.open(dialogReq);
    this.confirmDialog.confirmed().subscribe((confirmed) => {
      if (!this.kcProject || !confirmed) {
        return;
      }
      const update: ProjectUpdateRequest = {
        id: this.kcProject.id,
        removeKnowledgeSource: [$event]
      }
      this.projectService.updateProject(update);
    });
  }

  ksQueueRemove($event: KnowledgeSource) {
    this.ksQueueService.remove($event);
  }

  ksAdded($event: KnowledgeSource[]) {
    if (!this.kcProject) {
      return;
    }
    let update: ProjectUpdateRequest = {
      id: this.kcProject.id
    }
    this.projectService.updateProject(update);
  }

  projectChanged($event: ProjectModel) {
    this.projectService.updateProject({
      id: $event.id
    })
  }
}
