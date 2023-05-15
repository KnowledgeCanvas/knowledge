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
import { Component, OnDestroy, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { NotificationsService } from '@services/user-services/notifications.service';
import { ProjectCreationRequest } from '@app/models/project.model';
import { ProjectService } from '@services/factory-services/project.service';
import { Subject } from 'rxjs';
import { TreeNode } from 'primeng/api';

@Component({
  selector: 'app-project-creation-dialog',
  template: `
    <div class="p-fluid grid pt-3 mt-3">
      <div class="col-12 flex flex-row">
        <app-icon
          [icon]="projectCreationRequest.icon"
          (changed)="iconChange($event)"
        ></app-icon>

        <div class="field p-float-label w-full p-fluid ml-4">
          <input
            id="title"
            type="text"
            pInputText
            required
            [autofocus]="true"
            (keydown.enter)="create()"
            [minlength]="3"
            [maxLength]="64"
            [(ngModel)]="projectCreationRequest.name"
          />
          <label for="title">Title</label>
          <div *ngIf="projectCreationRequest.name.length < 3" class="p-error">
            Must be between 3 and 64 characters
          </div>
        </div>
      </div>

      <div class="field p-float-label col-12 mt-4">
        <project-selector
          label="Parent Project"
          [setDefault]="false"
          [setById]="projectCreationRequest.parentId.value"
          (onSelect)="onParentChange($event)"
        >
        </project-selector>
      </div>

      <div class="field p-float-label col-12 mt-3">
        <textarea
          pInputTextarea
          id="_ksDescription"
          [(ngModel)]="projectCreationRequest.description"
          [autoResize]="true"
          [rows]="4"
          [cols]="30"
        ></textarea>
        <label for="_ksDescription">Description</label>
      </div>
    </div>
    <div class="w-full flex flex-row justify-content-end">
      <button pButton (click)="create()" label="Create"></button>
    </div>
  `,
  styles: [],
})
export class ProjectCreationDialogComponent implements OnInit, OnDestroy {
  // A request, to be returned on form completion
  projectCreationRequest: ProjectCreationRequest;

  private cleanUp: Subject<any> = new Subject<any>();

  constructor(
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private notifications: NotificationsService,
    private projects: ProjectService
  ) {
    this.projectCreationRequest = {
      authors: [],
      calendar: { events: [], start: new Date(), end: null },
      description: '',
      knowledgeSource: [],
      sources: [],
      name: '',
      parentId: { value: '' },
      subProjects: [],
      topics: [],
      type: 'default',
      icon: 'pi pi-folder',
    };
  }

  ngOnInit(): void {
    setTimeout(() => {
      if (this.config.data.parentId) {
        this.projectCreationRequest.parentId = this.config.data.parentId;
      }
    });
  }

  ngOnDestroy() {
    this.cleanUp.next({});
    this.cleanUp.complete();
  }

  create(): void {
    if (this.projectCreationRequest.name.trim().length < 3) {
      return;
    }
    this.projects.newProject(this.projectCreationRequest).then(() => {
      this.ref.close();
    });
  }

  onParentChange($event?: TreeNode) {
    if ($event?.key) {
      this.projectCreationRequest.parentId = { value: $event.key };
    }
  }

  iconChange($event: any) {
    this.projectCreationRequest.icon = $event;
  }
}
