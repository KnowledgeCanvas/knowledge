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


import {Component, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {ProjectModel, ProjectUpdateRequest} from "projects/ks-lib/src/lib/models/project.model";
import {ProjectService} from "../../../../../ks-lib/src/lib/services/projects/project.service";
import {KnowledgeSource} from "../../../../../ks-lib/src/lib/models/knowledge.source.model";
import {KsQueueService} from "../../knowledge-source/ks-queue-service/ks-queue.service";
import {Subscription} from "rxjs";
import {KcDialogRequest, KcDialogService} from "../../../../../ks-lib/src/lib/services/dialog/kc-dialog.service";


@Component({
  selector: 'app-project-detail-viewport',
  templateUrl: './project-detail-viewport.component.html',
  styleUrls: ['./project-detail-viewport.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ProjectDetailViewportComponent implements OnInit, OnDestroy {
  kcProject: ProjectModel | null = null;

  ksQueue: KnowledgeSource[] = [];

  loading: boolean = false;

  private ksQueueSubscription: Subscription;

  private ksQueueLoadingSubscription: Subscription;

  private kcProjectSubscription: Subscription;

  constructor(private projectService: ProjectService,
              private ksQueueService: KsQueueService,
              private confirmDialog: KcDialogService
  ) {
    this.ksQueueSubscription = ksQueueService.ksQueue.subscribe((ksQueue) => {
      this.ksQueue = ksQueue;
    })

    this.ksQueueLoadingSubscription = ksQueueService.loading.subscribe((loading) => {
      this.loading = loading;
    })

    this.kcProjectSubscription = this.projectService.currentProject.subscribe(project => {
      console.debug('ProjectDetailViewport got updated project: ', project);
      if (project.id.value.trim() !== '')
        this.kcProject = project;
      else
        this.kcProject = null;
    });
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.ksQueueSubscription.unsubscribe();
    this.ksQueueLoadingSubscription.unsubscribe();
    this.kcProjectSubscription.unsubscribe();
  }

  ksImported($event: KnowledgeSource[]) {
    if (!this.kcProject) {
      return;
    }

    let update: ProjectUpdateRequest = {
      addKnowledgeSource: $event,
      id: this.kcProject.id
    }
    console.log('Update Project from ksImported in ProjectDetailViewport...');
    this.projectService.updateProject(update);
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
      console.log('Update Project from ksRemoved in ProjectDetailViewport...');
      this.projectService.updateProject(update);
    });
  }

  ksQueueRemove($event: KnowledgeSource) {
    this.ksQueueService.remove($event);
  }

  ksAdded($event: KnowledgeSource[]) {
    console.log('Adding KS to project: ', $event);

    if (!this.kcProject) {
      return;
    }

    let update: ProjectUpdateRequest = {
      id: this.kcProject.id
    }
    console.log('Update Project from ksAdded in ProjectDetailViewport...');
    this.projectService.updateProject(update);
  }

  projectChanged($event: ProjectModel) {
    console.log('Updating project from project details viewport...', $event);
    this.projectService.updateProject({
      id: $event.id
    })
  }
}
