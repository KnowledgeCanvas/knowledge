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

import {BehaviorSubject} from "rxjs";
import {Clipboard} from "@angular/cdk/clipboard";
import {ConfirmationService} from "primeng/api";
import {DialogService} from "primeng/dynamicdialog";
import {Injectable} from '@angular/core';
import {KcProject, ProjectUpdateRequest} from "@app/models/project.model";
import {NotificationsService} from "@services/user-services/notifications.service";
import {ProjectCreationDialogComponent} from "@components/project-components/project-creation-dialog.component";
import {ProjectService} from "@services/factory-services/project.service";
import {UUID} from "@shared/models/uuid.model";

@Injectable({
  providedIn: 'root'
})
export class ProjectCommandService {

  private _projectDetailEvent = new BehaviorSubject<KcProject | undefined>(undefined);
  detailEvent = this._projectDetailEvent.asObservable();

  private _projectRemoveEvent = new BehaviorSubject<KcProject[]>([]);
  removeEvent = this._projectRemoveEvent.asObservable();

  private _projectShareEvent = new BehaviorSubject<KcProject[]>([]);
  shareEvent = this._projectShareEvent.asObservable();

  private _projectCopyJSONEvent = new BehaviorSubject<KcProject[]>([]);
  copyJSONEvent = this._projectCopyJSONEvent.asObservable();

  private _projectUpdateEvent = new BehaviorSubject<ProjectUpdateRequest[]>([]);
  updateEvent = this._projectUpdateEvent.asObservable();

  constructor(private dialog: DialogService,
              private confirmation: ConfirmationService,
              private clipboard: Clipboard,
              private notifications: NotificationsService,
              private projects: ProjectService) {
  }

  new(parentId?: UUID) {
    this.dialog.open(ProjectCreationDialogComponent, {
      width: `min(90vw, 92rem)`,
      data: {parentId: parentId},
      style: {'border-radius': '10px'}
    })
  }

  update(projectList: ProjectUpdateRequest[]) {
    this._projectUpdateEvent.next(projectList);
  }

  async remove(projectList: KcProject[]) {
    if (projectList.length <= 0) {
      return;
    }

    const count = (id: string): number => {
      const project = this.projects.getProject(id);
      if (!project) {
        return 0;
      }

      if (!project.subprojects || project.subprojects.length === 0) {
        return 1;
      }

      return 1 + project.subprojects
        .map(s => count(s))
        .reduce((prev, curr) => {
          return prev + curr;
        });
    }

    let ids = projectList.map(p => p.id.value);
    let n = 0;
    for (let id of ids) {
      n += count(id);
    }

    this.confirmation.confirm({
      message: `Permanently remove ${n === 1 ? 'Project' : n + ' Projects'}?`,
      header: `Remove Project${n === 1 ? '' : 's'}`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Remove',
      rejectLabel: 'Keep',
      acceptButtonStyleClass: 'p-button-text p-button-danger',
      rejectButtonStyleClass: 'p-button-text',
      acceptIcon: 'pi pi-trash',
      accept: () => {
        for (let project of projectList) {
          this.projects.deleteProject(project.id);
        }
      }
    })
  }

  detail(project: KcProject) {
    this._projectDetailEvent.next(project);
  }

  share(projectList: KcProject[]) {
    this._projectShareEvent.next(projectList);
  }

  copyJSON(projectList: KcProject[]) {
    try {
      const pStr = JSON.stringify(projectList);
      this.clipboard.copy(pStr)
      this.notifications.success('Project Command', 'Copied to Clipboard!', '');
    } catch (_: any) {

    }

    this._projectCopyJSONEvent.next(projectList);
  }
}
