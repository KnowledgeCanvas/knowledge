/**
 Copyright 2022 Rob Royce

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
import {ProjectCreationRequest} from "src/app/models/project.model";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {ProjectService} from "../../services/factory-services/project.service";
import {KcProjectType} from "../../../../../kc_shared/models/project.model";
import {TreeNode} from "primeng/api";
import {ProjectTreeFactoryService} from "../../services/factory-services/project-tree-factory.service";
import {UUID} from "../../../../../kc_shared/models/uuid.model";
import {takeUntil, tap} from "rxjs/operators";
import {Subject} from "rxjs";
import {constructTreeNodes} from "../../workers/tree.worker";
import {NotificationsService} from "../../services/user-services/notifications.service";


@Component({
  selector: 'app-project-creation-dialog',
  template: `
    <p-panel header="New Project">
      <ng-template pTemplate="content">
        <br>
        <div class="p-fluid grid">
          <div class="field p-float-label sm:col-12 md:col-6 lg:col-6">
            <input id="title"
                   type="text"
                   pInputText
                   required
                   [autofocus]="true"
                   (keydown.enter)="create()"
                   [minlength]="3"
                   [maxLength]="64"
                   [(ngModel)]="projectCreationRequest.name">
            <label for="title">Title</label>
            <div *ngIf="projectCreationRequest.name.length < 3" class="p-error">
              Must be between 3 and 64 characters
            </div>
          </div>

          <div class="field p-float-label sm:col-12 md:col-6 lg:col-6">
            <p-treeSelect
              id="parentId"
              inputId="parentId"
              [options]="treeNodes"
              appendTo="body"
              [filter]="true"
              [filterInputAutoFocus]="true"
              scrollHeight="min(40vh, 48rem)"
              [(ngModel)]="selectedProject"
              (onNodeSelect)="onParentChange($event)">
            </p-treeSelect>
            <label for="parentId">Parent Project (Optional)</label>
          </div>

          <div class="field p-float-label sm:col-6 md:col-6 lg:col-6 mt-3">
            <p-calendar [(ngModel)]="projectCreationRequest.calendar.start"
                        [showButtonBar]="true" hourFormat="12" [showTime]="true"
                        [showIcon]="true" id="start" appendTo="body"></p-calendar>
            <label for="start">Start</label>
          </div>

          <div class="field p-float-label sm:col-6 md:col-6 lg:col-6 mt-3">
            <p-calendar [(ngModel)]="projectCreationRequest.calendar.end"
                        [showButtonBar]="true" hourFormat="12" [showTime]="true"
                        [showIcon]="true" id="end" appendTo="body"></p-calendar>
            <label for="end">End</label>
          </div>

          <div class="field p-float-label sm:col-12 md:col-12 lg:col-12 mt-3">
            <p-dropdown [options]="projectTypes"
                        [(ngModel)]="projectType"
                        id="type"
                        inputId="type"
                        optionLabel="name"></p-dropdown>
            <label for="type">Type</label>
          </div>

          <div class="field p-float-label sm:col-12 md:col-12 lg:col-12 mt-3">
            <p-chips [(ngModel)]="projectCreationRequest.topics"
                     inputId="topics"
                     [addOnBlur]="true" [addOnTab]="true" [allowDuplicate]="false"></p-chips>
            <label for="topics">Topics</label>
          </div>

          <div class="field p-float-label col-12 mt-3">
              <textarea pInputTextarea id="_ksDescription"
                        [(ngModel)]="projectCreationRequest.description"
                        [autoResize]="true" [rows]="4" [cols]="30"></textarea>
            <label for="_ksDescription">Description</label>
          </div>

        </div>
      </ng-template>
      <ng-template pTemplate="footer">
        <button pButton (click)="create()" label="Create"></button>
      </ng-template>
    </p-panel>
  `,
  styles: []
})

export class ProjectCreationDialogComponent implements OnInit, OnDestroy {
  // A request, to be returned on form completion
  projectCreationRequest: ProjectCreationRequest;

  // A list of potential project types
  projectTypes: { code: KcProjectType, name: string }[];

  // Instance used during the creation process
  projectType: { code: KcProjectType, name: string };

  treeNodes: TreeNode[] = [{key: '', label: 'None'}];

  selectedProject?: TreeNode;

  private cleanUp: Subject<any> = new Subject<any>();

  constructor(private ref: DynamicDialogRef,
              private config: DynamicDialogConfig,
              private notifications: NotificationsService,
              private projects: ProjectService,
              private projectTree: ProjectTreeFactoryService) {
    this.projectTypes = projects.ProjectTypes;

    this.projectType = this.projectTypes[0];

    this.projectCreationRequest = {
      authors: [],
      calendar: {events: [], start: null, end: null},
      description: "",

      // TODO: this should be removed
      knowledgeSource: [],
      sources: [],
      name: "",
      parentId: {value: ''},
      subProjects: [],
      topics: [],
      type: 'default'
    }

    this.projects.projectTree.pipe(
      takeUntil(this.cleanUp),
      tap((tree) => {
        this.notifications.debug('Project Creation Dialog', 'Project Tree Updated', 'constructing tree nodes...');
        this.treeNodes = this.treeNodes.concat(constructTreeNodes(tree, false));
        if (config.data.parentId) {
          const parentId: UUID = config.data.parentId;
          this.selectedProject = this.projectTree.findTreeNode(this.treeNodes, parentId.value);
          this.projectCreationRequest.parentId = config.data.parentId;
        }
      })
    ).subscribe()


  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.cleanUp.next({});
    this.cleanUp.complete();
  }

  create(): void {
    if (this.projectCreationRequest.name.trim().length < 3) {
      return;
    }
    this.projectCreationRequest.type = this.projectType.code;
    this.projects.newProject(this.projectCreationRequest).then((result) => {
      this.ref.close();
    });
  }

  onParentChange($event: any) {
    if ($event.node.key === '') {
      this.selectedProject = undefined;
    }

    this.projectCreationRequest.parentId = {value: $event.node.key}
  }
}
