/*
 * Copyright (c) 2023 Rob Royce
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
import {Component, OnDestroy, OnInit} from '@angular/core';
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {KcProjectType} from "@shared/models/project.model";
import {NotificationsService} from "@services/user-services/notifications.service";
import {ProjectCreationRequest} from "@app/models/project.model";
import {ProjectService} from "@services/factory-services/project.service";
import {Subject} from "rxjs";
import {TreeNode} from "primeng/api";

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
            <project-selector label="Parent Project (Optional)"
                              [setDefault]="false"
                              [setById]="projectCreationRequest.parentId.value"
                              (onSelect)="onParentChange($event)">
            </project-selector>
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

  private cleanUp: Subject<any> = new Subject<any>();

  constructor(private ref: DynamicDialogRef,
              private config: DynamicDialogConfig,
              private notifications: NotificationsService,
              private projects: ProjectService) {
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
  }

  ngOnInit(): void {
    setTimeout(() => {
      if (this.config.data.parentId) {
        this.projectCreationRequest.parentId = this.config.data.parentId;
      }
    })
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
    this.projects.newProject(this.projectCreationRequest).then((_) => {
      this.ref.close();
    });
  }

  onParentChange($event?: TreeNode) {
    if ($event?.key) {
      this.projectCreationRequest.parentId = {value: $event.key}
    }
  }
}
