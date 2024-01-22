/*
 * Copyright (c) 2023-2024 Rob Royce
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
import { KnowledgeSource } from '@app/models/knowledge.source.model';
import { WebsiteMetaTagsModel } from '@shared/models/web.source.model';
import { NotificationsService } from '@services/user-services/notifications.service';
import { Clipboard } from '@angular/cdk/clipboard';

@Component({
  selector: 'source-metadata',
  template: `
    <div *ngIf="ksMetadata.length > 0" class="source-metadata">
      <h3 class="text-2xl font-bold mt-4">Meta Tags</h3>
      <textarea
        *ngIf="source.rawText && source.rawText.length > 0"
        [(ngModel)]="source.rawText"
        [autoResize]="true"
        [rows]="10"
        class="p-fluid w-full"
        id="_ksRawText"
        pInputTextarea
        placeholder="Extracted Text"
      >
      </textarea>
      <p-table
        [resizableColumns]="true"
        [value]="ksMetadata"
        tableStyleClass="w-full overflow-x-auto surface-section"
      >
        <ng-template pTemplate="header">
          <tr>
            <th class="ks-info-table" pSortableColumn="key">
              Key
              <p-sortIcon field="key"></p-sortIcon>
            </th>
            <th class="ks-info-table" pSortableColumn="value">
              Value
              <p-sortIcon field="value"></p-sortIcon>
            </th>
            <th class="ks-info-table" pSortableColumn="property">
              Property
              <p-sortIcon field="property"></p-sortIcon>
            </th>
          </tr>
        </ng-template>
        <ng-template let-meta pTemplate="body">
          <tr
            *ngIf="meta.key.length > 0 && meta.value.length > 0"
            class="cursor-pointer surface-section"
          >
            <td
              (click)="toClipboard(meta.key)"
              class="ks-info-table hover:surface-hover"
            >
              {{ meta.key | truncate : [80] }}
            </td>
            <td
              (click)="toClipboard(meta.value)"
              class="ks-info-table hover:surface-hover"
            >
              {{ meta.value | truncate : [120] }}
            </td>
            <td
              (click)="toClipboard(meta.property)"
              class="ks-info-table hover:surface-hover"
            >
              {{ meta.property | truncate : [120] }}
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>
  `,
  styleUrls: ['./source.styles.scss'],
})
export class SourceMetadataComponent implements OnInit {
  source!: KnowledgeSource;

  /* If the source is a website, this will contain the metadata for the website and sanitized to prevent XSS attacks */
  ksMetadata: WebsiteMetaTagsModel[] = [];

  constructor(
    private clipboard: Clipboard,
    private notify: NotificationsService
  ) {}

  ngOnInit(): void {
    this.ksMetadata =
      this.source.reference.source.website?.metadata?.meta ?? [];
  }

  /* When the user clicks on the "Copy" button, copy the source key to the clipboard  */
  toClipboard(key: string) {
    if (key && key.trim().length > 0) {
      this.clipboard.copy(key);
      this.notify.success('Source Info', 'Copied to Clipboard', '');
    }
  }
}
