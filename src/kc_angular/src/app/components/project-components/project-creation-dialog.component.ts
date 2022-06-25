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

import {Component, OnInit} from '@angular/core';
import {ProjectCreationRequest} from "src/app/models/project.model";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {ProjectService} from "../../services/factory-services/project.service";
import {KcProjectType} from "../../../../../kc_shared/models/project.model";


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
          </div>

          <div class="field p-float-label sm:col-12 md:col-6 lg:col-6 ">
            <input id="parentId" type="text" pInputText [ngModel]="parentProjectName" disabled>
            <label for="parentId">Parent Project</label>
          </div>

          <div class="field p-float-label sm:col-6 md:col-6 lg:col-6 ">
            <p-calendar [(ngModel)]="projectCreationRequest.calendar.start"
                        [showButtonBar]="true" hourFormat="12" [showTime]="true"
                        [showIcon]="true" id="start" appendTo="body"></p-calendar>
            <label for="start">Start</label>
          </div>

          <div class="field p-float-label sm:col-6 md:col-6 lg:col-6 ">
            <p-calendar [(ngModel)]="projectCreationRequest.calendar.end"
                        [showButtonBar]="true" hourFormat="12" [showTime]="true"
                        [showIcon]="true" id="end" appendTo="body"></p-calendar>
            <label for="end">End</label>
          </div>

          <div class="field sm:col-12 md:col-12 lg:col-12 ">
            <p-dropdown [options]="projectTypes"
                        [(ngModel)]="projectType"
                        id="type"
                        optionLabel="name"></p-dropdown>
          </div>

          <div class="field p-float-label sm:col-12 md:col-12 lg:col-12 ">
            <p-chips [(ngModel)]="projectCreationRequest.topics"
                     [addOnBlur]="true" [addOnTab]="true" [allowDuplicate]="false"></p-chips>
            <label for="parentId">Topics</label>
          </div>

          <div class="field p-float-label col-12 ">
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

export class ProjectCreationDialogComponent implements OnInit {
  // A request, to be returned on form completion
  projectCreationRequest: ProjectCreationRequest;

  // The name of the parent project (if any)
  parentProjectName: string = 'None';

  // A list of potential project types
  projectTypes: { code: KcProjectType, name: string }[];

  // Instance used during the creation process
  projectType: { code: KcProjectType, name: string };

  constructor(private ref: DynamicDialogRef,
              private config: DynamicDialogConfig,
              private projectService: ProjectService) {
    this.projectTypes = projectService.ProjectTypes;
    this.projectType = this.projectTypes[0];
    this.projectCreationRequest = {
      authors: [],
      calendar: {events: [], start: null, end: null},
      description: "",
      knowledgeSource: [],
      name: "",
      parentId: config.data.parentId,
      subProjects: [],
      topics: [],
      type: 'default'
    }
  }

  ngOnInit(): void {
    if (this.projectCreationRequest.parentId?.value) {
      this.parentProjectName = this.projectService.getProject(
        this.projectCreationRequest.parentId.value)?.name ?? 'None';
    }
  }

  create(): void {
    if (this.projectCreationRequest.name.trim().length < 3) {
      return;
    }

    this.projectCreationRequest.type = this.projectType.code;
    console.debug('ProjectCreationDialog.create() | projectCreationRequest: ', this.projectCreationRequest);
    this.projectService.newProject(this.projectCreationRequest).then((result) => {
      this.ref.close();
    });
  }
}
