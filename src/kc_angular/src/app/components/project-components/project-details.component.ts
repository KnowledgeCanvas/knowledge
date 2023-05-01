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

import { Component } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { KcProject } from '@app/models/project.model';

@Component({
  selector: 'app-project-details',
  template: `
    <div class="w-full flex-row-center-between pb-3 pt-3 sticky">
      <div class="flex-row-center-start w-full"></div>
      <div class="flex-row-center-end">
        <div *ngIf="saved" class="flex-row-center-start text-primary">
          <div class="pi pi-check"></div>
          <div class="px-3">Saved</div>
        </div>
        <div>
          <button
            pButton
            class="p-button-text p-button-rounded"
            icon="pi pi-times"
            (click)="onClose()"
          ></button>
        </div>
      </div>
    </div>
    <div style="height: calc(100% - 65px); overflow-y: auto">
      <app-project-info
        [project]="project"
        [collapseAll]="collapsed"
      ></app-project-info>
    </div>
    <app-project-breadcrumb
      [disabled]="true"
      [projectId]="project.id.value"
      class="w-full p-fluid"
    >
    </app-project-breadcrumb>
  `,
  styles: [],
})
export class ProjectDetailsComponent {
  project!: KcProject;

  saved = false;

  collapsed = false;

  constructor(
    private config: DynamicDialogConfig,
    private ref: DynamicDialogRef
  ) {
    if (this.config?.data?.project) {
      this.project = this.config.data.project;
    }
  }

  onClose() {
    this.ref.close();
  }

  collapseAll() {
    this.collapsed = true;
  }

  expandAll() {
    this.collapsed = false;
  }
}
