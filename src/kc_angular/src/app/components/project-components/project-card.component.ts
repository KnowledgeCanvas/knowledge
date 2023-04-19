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

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { KcProject } from '@app/models/project.model';
import { UUID } from '@shared/models/uuid.model';
import { DataService } from '@services/user-services/data.service';

@Component({
  selector: 'app-project-card',
  template: `
    <p-panel *ngIf="kcProject">
      <ng-template pTemplate="header">
        {{ kcProject.name }}
      </ng-template>

      <ng-template pTemplate="icons">
        <button
          pButton
          *ngIf="showEdit"
          class="p-panel-header-icon p-link"
          icon="pi pi-pencil"
          pTooltip="Edit {{ kcProject.name }}"
          (click)="onEditProject.emit(kcProject.id)"
        ></button>
        <button
          pButton
          *ngIf="showAddSubproject"
          class="p-panel-header-icon p-link"
          icon="pi pi-plus-circle"
          pTooltip="Add a subproject"
          (click)="onAddSubproject.emit(kcProject.id)"
        ></button>
        <button
          pButton
          *ngIf="showRemove"
          class="p-panel-header-icon p-link"
          icon="pi pi-trash"
          pTooltip="Remove {{ kcProject.name }}"
          (click)="onRemoveProject.emit(kcProject.id)"
        ></button>
        <button
          pButton
          *ngIf="showArchive"
          class="p-panel-header-icon p-link"
          icon="pi pi-folder"
          pTooltip="Archive {{ kcProject.name }}"
          (click)="onArchiveProject.emit(kcProject.id)"
        ></button>
        <button
          pButton
          *ngIf="showNavigate"
          class="p-panel-header-icon p-link"
          icon="pi pi-arrow-circle-right"
          pTooltip="Goto {{ kcProject.name }}"
          (click)="onNavigateToProject.emit(kcProject.id)"
        ></button>
      </ng-template>

      <ng-template pTemplate="content">
        <div class="flex-row-center-between w-full">
          <div class="flex flex-column flex-auto">
            <div>
              <b>Project Type:</b> {{ kcProject.type || 'Default' | titlecase
              }}<br />
              <b>Date Created:</b> {{ kcProject.dateCreated | date : 'medium'
              }}<br />
              <b>Last Modified:</b> {{ kcProject.dateModified | date : 'medium'
              }}<br />
              <b>Last Accessed:</b> {{ kcProject.dateAccessed | date : 'medium'
              }}<br />
            </div>
            <div *ngIf="!kcProject.topics.length"><b>Topics:</b> None</div>
            <div>
              <b>Knowledge Sources:</b> {{ kcProject.knowledgeSource.length
              }}<br />
              <b>Subprojects: </b> {{ kcProject.subprojects.length }}
            </div>
            <b>Description:</b>
            <div
              style="max-height: 200px; overflow-x: auto; overflow-y: hidden"
            >
              {{ kcProject.description || 'None' }}<br />
            </div>
          </div>
        </div>
      </ng-template>
    </p-panel>

    <p-panel header="Subprojects" class="pt-4">
      <div class="flex flex-column flex-auto">
        <div class="text-2xl">Subprojects</div>
        <p-scrollPanel [style]="{ 'max-height': '180px' }">
          <span
            *ngFor="let subproject of kcProject?.subprojects"
            class="flex-row-center-between"
          >
            {{ subproject | projectName }}
            <button
              pButton
              *ngIf="showSubprojectNavigate"
              icon="pi pi-arrow-circle-right"
              class="p-button-rounded p-button-text"
              pTooltip="Goto {{ subproject | projectName }}"
              (click)="navigate(subproject)"
            ></button>
          </span>
          <span *ngIf="!kcProject?.subprojects?.length"> None </span>
        </p-scrollPanel>
      </div>
    </p-panel>

    <p-panel header="Topics" class="pt-4">
      <div *ngIf="topics?.length">
        <b>Topics:</b>
        <p-chips [(ngModel)]="topics"></p-chips>
      </div>
    </p-panel>
  `,
  styles: [],
})
export class ProjectCardComponent {
  /**
   * The project to be displayed on this card.
   */
  @Input() kcProject?: KcProject | null;

  /**
   * Whether to display the "Archive Project" button.
   * Default is false.
   */
  @Input() showArchive = false;

  /**
   * Whether to display the "Remove Project" button.
   * Default is true.
   */
  @Input() showRemove = true;

  /**
   * Whether to display the "Edit Project" button.
   * Default is true.
   */
  @Input() showEdit = true;

  /**
   * Whether to display the "Add Subproject" button.
   * Default is true.
   */
  @Input() showAddSubproject = true;

  /**
   * Whether to display the "GoTo Project" button.
   * Default is true.
   */
  @Input() showNavigate = true;

  /**
   * Whether to display the "GoTo Project" button for subprojects.
   * Default is true.
   */
  @Input() showSubprojectNavigate = true;

  /**
   * Emitted when the "edit" button is pressed.
   * Contains the ID of the project to be edited.
   */
  @Output() onEditProject = new EventEmitter<UUID>();

  /**
   * Emitted when the "GoTo" button is pressed.
   * Contains the ID of the project to be navigated to.
   */
  @Output() onNavigateToProject = new EventEmitter<UUID>();

  /**
   * Emitted when the "Add Subproject" button is pressed.
   * Contains the ID of the parent project.
   */
  @Output() onAddSubproject = new EventEmitter<UUID>();

  /**
   * Emitted when the "Remove Project" button is pressed.
   * Contains the ID of the project to be removed.
   */
  @Output() onRemoveProject = new EventEmitter<UUID>();

  /**
   * Emitted when the "Archive Project" button is pressed.
   * Contains the ID of the project to be archived.
   */
  @Output() onArchiveProject = new EventEmitter<UUID>();

  topics: string[] = [];

  constructor(private data: DataService) {
    data.ksList.subscribe((ksList) => {
      if (ksList.length > 0) {
        this.topics = Array.from(
          new Set(
            ksList
              .map((ks) => ks.topics)
              .reduce((previousValue, currentValue) => {
                if (previousValue && currentValue) {
                  return previousValue.concat(currentValue);
                } else if (previousValue) {
                  return previousValue;
                } else if (currentValue) {
                  return currentValue;
                } else {
                  return [];
                }
              })
          )
        );
      } else {
        this.topics = [];
      }
    });
  }

  /**
   * Convenience method that transforms a project ID string to UuidModel
   * @param id
   */
  navigate(id: string) {
    this.onNavigateToProject.emit({ value: id });
  }
}
