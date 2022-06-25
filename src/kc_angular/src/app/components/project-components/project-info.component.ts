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
import {KcProject} from "../../models/project.model";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";

@Component({
  selector: 'app-project-info',
  template: `
    <p-panel header="Project Details" [style]="{'width': '75vw', 'max-width': '64rem'}">
      <ng-template pTemplate="content">
        <br>
        <div class="p-fluid grid">
          <div class="field p-float-label sm:col-12 md:col-12 lg:col-12 mb-5">
            <input id="title" type="text" pInputText required
                   [(ngModel)]="project.name">
            <label for="title">Title</label>
          </div>

          <div class="field p-float-label sm:col-6 md:col-6 lg:col-6 mb-5">
            <p-calendar [(ngModel)]="start" (ngModelChange)="onStartChange($event)"
                        [showTime]="true" [showButtonBar]="true" hourFormat="12"
                        [showIcon]="true" id="start" appendTo="body"></p-calendar>
            <label for="start">Start</label>
          </div>

          <div class="field p-float-label sm:col-6 md:col-6 lg:col-6 mb-5">
            <p-calendar [(ngModel)]="end" (ngModelChange)="onEndChange($event)"
                        [showTime]="true" [showButtonBar]="true" hourFormat="12"
                        [showIcon]="true" id="end" appendTo="body"></p-calendar>
            <label for="end">End</label>
          </div>

          <div class="field p-float-label sm:col-12 md:col-12 lg:col-12 mb-5">
            <p-chips [(ngModel)]="project.topics" id="topics"
                     [addOnBlur]="true" [addOnTab]="true" [allowDuplicate]="false"></p-chips>
            <label for="topics">Topics</label>
          </div>

          <div class="field p-float-label col-12 mb-5">
              <textarea pInputTextarea id="_ksDescription"
                        [(ngModel)]="project.description"
                        [autoResize]="true" [rows]="4" [cols]="30"></textarea>
            <label for="_ksDescription">Description</label>
          </div>

          <div class="field p-float-label sm:col-6 md:col-6 lg:col-6 mb-5">
            <input id="parentId" type="text" pInputText disabled
                   ngModel="{{project.parentId | projectName}}">
            <label for="parentId">Parent Project</label>
          </div>

          <div class="field p-float-label sm:col-6 md:col-6 lg:col-6 mb-5">
            <input id="type" type="text" pInputText disabled
                   ngModel="{{project.type | projectType}}">
            <label for="type">Project Type</label>
          </div>
        </div>
      </ng-template>
    </p-panel>
  `,
  styles: []
})
export class ProjectInfoComponent implements OnInit {
  project: KcProject;
  start: Date | null = null;
  end: Date | null = null;

  constructor(private ref: DynamicDialogRef, private config: DynamicDialogConfig) {
    // Get the specified project
    this.project = config.data.project;

    if (typeof this.project.calendar.start === 'string') {
      this.start = new Date(this.project.calendar.start);
    } else {
      this.start = this.project.calendar.start;
    }

    if (typeof this.project.calendar.end === 'string') {
      this.end = new Date(this.project.calendar.end);
    } else {
      this.end = this.project.calendar.end;
    }

  }

  ngOnInit(): void {
  }


  onEndChange($event?: Date) {
    // This function explicitly synchronizes project end date with surrogate
    if (!$event) {
      this.project.calendar.end = null;
      return;
    }
    this.project.calendar.end = $event;
  }

  onStartChange($event?: Date) {
    // This function explicitly synchronizes project start date with surrogate
    if (!$event) {
      this.project.calendar.start = null;
      return;
    }
    this.project.calendar.start = $event;
  }
}
