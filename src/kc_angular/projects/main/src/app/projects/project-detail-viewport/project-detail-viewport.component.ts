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
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import {FileUploadComponent} from "../../ingest/files/file-upload/file-upload.component";
import {BrowserViewDialogService} from "../../../../../ks-lib/src/lib/services/browser-view-dialog/browser-view-dialog.service";
import {KsFactoryService} from "../../../../../ks-lib/src/lib/services/ks-factory/ks-factory.service";
import {WebsiteExtractionComponent} from "../../ingest/website-extraction/website-extraction.component";
import {MatSnackBar} from "@angular/material/snack-bar";


@Component({
  selector: 'app-project-detail-viewport',
  templateUrl: './project-detail-viewport.component.html',
  styleUrls: ['./project-detail-viewport.component.scss'],
})
export class ProjectDetailViewportComponent implements OnInit, OnDestroy {
  kcProject: ProjectModel | undefined = undefined;

  ksQueue: KnowledgeSource[] = [];

  private ksQueueSubscription: Subscription;

  private kcProjectSubscription: Subscription;

  constructor(private browserViewDialogService: BrowserViewDialogService,
              private projectService: ProjectService,
              private ksQueueService: KsQueueService,
              private confirmDialog: KcDialogService,
              private ksFactory: KsFactoryService,
              private snackbar: MatSnackBar,
              private dialog: MatDialog,) {
    this.ksQueueSubscription = ksQueueService.ksQueue.subscribe((ksQueue) => {
      this.ksQueue = ksQueue;
    })
    this.kcProjectSubscription = this.projectService.currentProject.subscribe(project => {
      this.kcProject = project.id.value.trim() === '' ? undefined : project;
    });
  }

  addFile = () => {
    this.dialog.open(FileUploadComponent, {width: '50%', minWidth: '512px', maxWidth: '650px', data: this.kcProject});
  }

  addLink = () => {
    const config: MatDialogConfig = {width: '50%', minWidth: '512px', maxWidth: '650px'}
    this.dialog.open(WebsiteExtractionComponent, config);
  }

  topicSearch = () => {
    if (!this.kcProject || !this.kcProject.topics || this.kcProject.topics.length === 0) {
      this.snackbar.open('Add some topics first...', 'Oh, right!', {duration: 3000});
      return;
    }
    let topics: string[] | undefined = this.kcProject.topics;
    if (topics) {
      let query = topics.join(' AND ');
      let searchKS = this.ksFactory.searchKS(query);
      this.browserViewDialogService.open({ks: searchKS});
    }
  }

  search = () => {
    let searchKS = this.ksFactory.searchKS();
    this.browserViewDialogService.open({ks: searchKS});
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

  ksImported(ksList: KnowledgeSource[]) {
    // Timeout used to give other components the chance to finish animations (i.e. don't force a bottleneck)
    setTimeout(() => {
      if (!this.kcProject) {
        return;
      }
      let update: ProjectUpdateRequest = {
        addKnowledgeSource: ksList,
        id: this.kcProject.id
      }
      this.projectService.updateProject(update);
    }, 1000);
  }

  ksQueueCleared() {
    this.ksQueueService.clearResults();
  }

  ksRemoved(ks: KnowledgeSource) {
    if (!this.kcProject) {
      return;
    }
    let dialogReq: KcDialogRequest = {
      actionButtonText: "Remove Source",
      actionToTake: 'delete',
      cancelButtonText: "Cancel",
      listToDisplay: [ks],
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
        removeKnowledgeSource: [ks]
      }
      this.projectService.updateProject(update);
    });
  }

  ksQueueRemove(ks: KnowledgeSource) {
    this.ksQueueService.remove(ks);
  }

  ksAdded(ks: KnowledgeSource[]) {
    if (!this.kcProject) {
      return;
    }
    // Since the KS has already been added to the project ks list, perform simple update
    let update: ProjectUpdateRequest = {
      id: this.kcProject.id
    }
    this.projectService.updateProject(update);
  }

  projectChanged(project: ProjectModel) {
    this.projectService.updateProject({
      id: project.id
    })
  }
}
