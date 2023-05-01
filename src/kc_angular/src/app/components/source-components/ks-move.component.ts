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
import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { KnowledgeSource } from '@app/models/knowledge.source.model';
import { CardOptions } from '@shared/models/settings.model';
import { ProjectService } from '@services/factory-services/project.service';
import { NotificationsService } from '@services/user-services/notifications.service';

@Component({
  selector: 'app-ks-move',
  template: `
    <div>
      <app-ks-card-list
        [ksList]="ksList"
        [ksCardOptions]="options"
        [allowMoveAll]="true"
        [allowResize]="false"
        [allowExport]="false"
        [allowCustomization]="false"
        [minimal]="true"
        (onProjectChange)="onProjectChange($event)"
      >
      </app-ks-card-list>
    </div>
  `,
})
export class KsMoveComponent implements OnInit {
  ksList: KnowledgeSource[] = [];

  options: CardOptions = {
    showContentType: false,
    showDescription: false,
    showEdit: true,
    showOpen: true,
    showSavePdf: true,
    showPreview: true,
    showIcon: true,
    showProjectName: true,
    showProjectSelection: true,
    showRemove: false,
    showTopics: false,
    showThumbnail: false,
  };

  constructor(
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private projects: ProjectService,
    private notifications: NotificationsService
  ) {
    this.ksList = config.data.ksList ?? [];
  }

  ngOnInit(): void {
    this.options = {
      showContentType: true,
      showDescription: false,
      showEdit: false,
      showOpen: false,
      showSavePdf: false,
      showPreview: false,
      showIcon: true,
      showProjectName: true,
      showProjectSelection: true,
      showRemove: false,
      showTopics: false,
      showThumbnail: false,
    };
  }

  onProjectChange(data: { ks: KnowledgeSource; old: string; new: string }) {
    this.projects
      .updateProjects([
        {
          id: { value: data.old },
          moveKnowledgeSource: { ks: data.ks, new: { value: data.new } },
        },
      ])
      .then(() => {
        this.notifications.success(
          'Source Move',
          'Source Moved',
          data.ks.title
        );
      });
  }
}
