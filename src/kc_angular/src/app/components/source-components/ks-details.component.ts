/**
 * Copyright 2022 Rob Royce
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import {Component, OnInit} from '@angular/core';
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {KnowledgeSource} from "../../models/knowledge.source.model";
import {NotificationsService} from "../../services/user-services/notifications.service";

@Component({
  selector: 'app-details',
  template: `
    <app-ks-info [ks]="ks" (shouldClose)="onClose()"></app-ks-info>`,
  styles: ['']
})
export class KsDetailsComponent implements OnInit {
  ks!: KnowledgeSource;

  constructor(private config: DynamicDialogConfig,
              private ref: DynamicDialogRef,
              private notifications: NotificationsService) {
    if (config?.data?.ks) {
      this.ks = config.data.ks;
    } else {
      this.notifications.error('Source Details', 'Invalid Source', 'Could not find a source to display.');
    }
  }

  ngOnInit(): void {

  }

  onClose() {
    this.ref.close();
  }
}
