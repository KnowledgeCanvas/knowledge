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

import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { KnowledgeSource } from '@app/models/knowledge.source.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { KsCommandService } from '@services/command-services/ks-command.service';
import { ElectronIpcService } from '@services/ipc-services/electron-ipc.service';
import { NotificationsService } from '@services/user-services/notifications.service';
import { SearchService } from '@services/user-services/search.service';
import { skip } from 'rxjs';

@Component({
  selector: 'source-details',
  template: `
    <div class="w-full flex flex-column">
      <div class="source-header">
        <div class="source-header-div">
          <div class="source-thumbnail">
            <app-ks-thumbnail [ks]="source" class="col-12"></app-ks-thumbnail>
            <div class="source-actions">
              <app-action-bar
                (flag)="flag()"
                (open)="open()"
                (preview)="preview()"
                (remove)="removeSource()"
                [ks]="source"
                [showEdit]="false"
                [showPreview]="false"
                [showFlag]="true"
                [showChat]="false"
                class="w-full p-fluid"
              >
              </app-action-bar>
            </div>
          </div>
          <div class="source-form">
            <div class="col-12">
              <form [formGroup]="form">
                <div class="p-fluid grid h-full">
                  <div class="col-12">
                    <h3 class="font-bold text-2xl">Title</h3>
                    <input
                      formControlName="title"
                      id="title"
                      minlength="3"
                      pInputText
                      required
                      type="text"
                    />
                  </div>
                  <div class="col-12">
                    <h3 class="font-bold text-2xl">Topics</h3>
                    <p-chips
                      (onChipClick)="topicSearch($event)"
                      [addOnBlur]="true"
                      [addOnTab]="true"
                      [allowDuplicate]="false"
                      inputId="topics"
                      separator=","
                      formControlName="topics"
                      placeholder="Start typing to add a topic..."
                    >
                    </p-chips>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div class="source-header-div">
          <div class="source-description col-12">
            <div
              class="flex flex-row w-full"
              proTip
              tipHeader="Express Yourself with Notes"
              tipMessage="Embrace your creativity using the Notes feature! It supports Markdown rendering, allowing you to craft visually engaging notes. Find something valuable in a source? Extract and save it directly to Notes by highlighting and right-clicking in the Browser tab. Make it your personal knowledge playground!"
              [tipGroups]="['source', 'intro']"
            >
              <h3 class="font-bold text-2xl">Notes</h3>
              <div class="flex justify-content-end align-items-center w-full">
                <!-- Buttons to switch between markdown preview and editable form -->
                <div class="align-items-center">
                  <button
                    (click)="showMarkdownPreview = true"
                    [disabled]="showMarkdownPreview"
                    class="p-button-sm p-button-rounded p-button-text"
                    icon="pi pi-eye"
                    pButton
                  ></button>
                  <button
                    (click)="showMarkdownPreview = false"
                    [disabled]="!showMarkdownPreview"
                    class="p-button-sm p-button-rounded p-button-text"
                    icon="pi pi-pencil"
                    pButton
                    pTooltip="Edit Markdown"
                    tooltipPosition="left"
                  ></button>
                </div>
              </div>
            </div>

            <div
              class="flex flex-column flex-grow-1 w-full"
              style="height: calc(100% - 5rem) !important;"
            >
              <div class="source-description-container">
                <div
                  *ngIf="showMarkdownPreview"
                  [innerHTML]="
                    source.description
                      ? (source.description | markdown | sanitizeHtml)
                      : ('Add a description, notes, or other information here using [Markdown](https://www.markdownguide.org/basic-syntax/) formatting.'
                        | markdown
                        | sanitizeHtml)
                  "
                  class="w-full h-full max-h-fit ks-description select-text overflow-y-auto"
                  [class.text-500]="!source.description"
                  [class.align-items-center]="!source.description"
                  [class.justify-content-center]="!source.description"
                  [class.flex]="!source.description"
                ></div>
                <form [formGroup]="form">
                  <div>
                    <textarea
                      *ngIf="!showMarkdownPreview"
                      class="w-full h-full max-h-fit ks-description"
                      [rows]="24"
                      formControlName="description"
                      id="_ksDescription"
                      pInputTextarea
                      placeholder="Description"
                    >
                    </textarea>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="source-header">
        <div class="col-12">
          <div class="source-model">
            <h3 class="font-bold text-2xl">Model</h3>
            <div
              class="p-fluid flex flex-wrap surface-section border-round-2xl p-2"
            >
              <div
                class="field p-float-label sm:col-12 md:col-12 lg:col-6 mt-4"
              >
                <input
                  [value]="source.id.value"
                  id="sourceId"
                  disabled
                  pInputText
                  type="text"
                />
                <label for="sourceId">Source ID</label>
              </div>

              <div
                class="field p-float-label sm:col-12 md:col-12 lg:col-6 mt-4"
              >
                <input
                  [value]="source.associatedProject.value"
                  id="ksProject"
                  disabled
                  pInputText
                  type="text"
                />
                <label for="ksProject">Associated Project ID</label>
              </div>

              <div
                class="field p-float-label sm:col-12 md:col-12 lg:col-6 mt-4"
              >
                <input
                  [value]="source.ingestType | titlecase"
                  id="ingestType"
                  disabled
                  pInputText
                  type="text"
                />
                <label for="ingestType">Ingest Type</label>
              </div>

              <div
                class="field p-float-label sm:col-12 md:col-12 lg:col-6 mt-4"
              >
                <input
                  [value]="source.importMethod | importMethod"
                  id="importMethod"
                  disabled
                  pInputText
                  type="text"
                />
                <label for="importMethod">Import Method</label>
              </div>

              <div
                class="field p-float-label sm:col-12 md:col-12 lg:col-6 mt-4"
              >
                <input
                  [value]="source.icon"
                  id="sourceIcon"
                  disabled
                  pInputText
                  type="text"
                />
                <label for="sourceIcon">Icon Encoding</label>
              </div>

              <div
                class="field p-float-label sm:col-12 md:col-12 lg:col-6 mt-4"
              >
                <input
                  [value]="source.iconUrl"
                  id="iconUrl"
                  disabled
                  pInputText
                  type="text"
                />
                <label for="iconUrl">Icon URL</label>
              </div>

              <div
                class="field p-float-label sm:col-12 md:col-12 lg:col-6 mt-4 p-fluid p-inputgroup"
              >
                <input
                  [value]="source.accessLink"
                  id="accessLink"
                  disabled
                  pInputText
                  style="width: calc(100% - 6rem)"
                  type="text"
                />
                <label for="accessLink">Access Link</label>
                <button
                  (click)="show(source.accessLink)"
                  label="Show"
                  pButton
                  style="width: 6rem"
                ></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./source.styles.scss'],
})
export class SourceDetailsComponent implements OnInit {
  source!: KnowledgeSource;

  form: FormGroup;

  showMarkdownPreview = true;

  @Output() remove = new EventEmitter<KnowledgeSource>();

  @Output() update = new EventEmitter<KnowledgeSource>();

  constructor(
    private fb: FormBuilder,
    private command: KsCommandService,
    private ipc: ElectronIpcService,
    private notify: NotificationsService,
    private search: SearchService
  ) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      topics: [[]],
      dateDue: [''],
    });

    this.form.valueChanges
      .pipe(skip(1), debounceTime(500), distinctUntilChanged(this.checkChanges))
      .subscribe((formValue) => {
        this.source.title = formValue.title;
        this.source.description = formValue.description;
        this.source.topics = formValue.topics;
        this.source.dateDue = formValue.dateDue;
        this.update.emit(this.source);
      });
  }

  checkChanges(prev: any, next: any) {
    return JSON.stringify(prev) === JSON.stringify(next);
  }

  ngOnInit() {
    this.form.patchValue(this.source);
  }

  flag() {
    this.source.flagged = !this.source.flagged;
    this.update.emit(this.source);
  }

  open() {
    this.command.open(this.source);
  }

  preview() {
    this.command.preview(this.source);
  }

  removeSource() {
    this.command.remove([this.source]);
    this.remove.emit(this.source);
  }

  topicSearch(topic: any) {
    this.search.executeSearch(topic.value);
  }

  show(accessLink: URL | string) {
    if (typeof accessLink === 'string') {
      this.ipc.showItemInFolder(accessLink);
      this.notify.debug('Source Info', 'Locating Folder', location, 'toast');
    } else {
      this.command.open(this.source);
    }
  }
}
