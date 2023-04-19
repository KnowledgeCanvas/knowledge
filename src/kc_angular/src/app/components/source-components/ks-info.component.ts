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

import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SecurityContext,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { AgentType, ChatMessage } from '@app/models/chat.model';
import { BrowserViewDialogService } from '@services/ipc-services/browser-view-dialog.service';
import { ChatCompletionResponseMessage } from 'openai';
import { ChatService } from '@services/chat-services/chat.service';
import { ChatViewComponent } from '../chat-components/chat.component';
import { Clipboard } from '@angular/cdk/clipboard';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ElectronIpcService } from '@services/ipc-services/electron-ipc.service';
import { FileViewConfig } from '@shared/models/browser.view.model';
import { FormBuilder, FormGroup } from '@angular/forms';
import {
  KnowledgeSource,
  KnowledgeSourceEvent,
} from '@app/models/knowledge.source.model';
import { KsCommandService } from '@services/command-services/ks-command.service';
import { NotificationsService } from '@services/user-services/notifications.service';
import { Router } from '@angular/router';
import { SettingsService } from '@services/ipc-services/settings.service';
import { SourceChatService } from '@services/chat-services/source-chat.service';
import { TopicService } from '@services/user-services/topic.service';
import { UuidService } from '@services/ipc-services/uuid.service';
import { WebsiteMetaTagsModel } from '@shared/models/web.source.model';
import { YouTubePlayer } from '@angular/youtube-player';
import {
  debounceTime,
  distinctUntilChanged,
  finalize,
  take,
  takeUntil,
  tap,
  timeout,
} from 'rxjs/operators';
import { skip, Subject } from 'rxjs';

/**
 * A class to hold the state of the collapsible panels
 *
 * @param collapsed - set all panels to collapsed or expanded depending on the value of this parameter
 */
class CollapseState {
  details: boolean;
  project: boolean;
  chat: boolean;
  pdf: boolean;
  youtube: boolean;
  timeline: boolean;
  metadata: boolean;
  sourcemodel: boolean;

  constructor(collapsed: boolean) {
    this.details =
      this.project =
      this.pdf =
      this.youtube =
      this.timeline =
      this.metadata =
      this.sourcemodel =
      this.chat =
        collapsed;
  }
}

@Component({
  selector: 'app-ks-info',
  template: `
    <p-scrollPanel class="w-full h-full">
      <div class="flex flex-column gap-2">
        <p-panel
          header="Details"
          class="col-12 pt-0"
          [toggleable]="true"
          [(collapsed)]="collapsed.details"
          toggler="header"
        >
          <div class="w-full h-full flex flex-wrap surface-section p-2">
            <div class="col-12 lg:col-6">
              <div class="flex flex-row flex-auto w-full">
                <app-ks-thumbnail
                  [ks]="ks"
                  class="col-12 border-1 border-dashed border-100 border-round"
                ></app-ks-thumbnail>
              </div>
              <div class="flex flex-row flex-auto w-full">
                <app-action-bar
                  class="w-full p-fluid"
                  [showEdit]="false"
                  [showFlag]="true"
                  [flagged]="ks.flagged"
                  (onFlagged)="onFlagged($event)"
                  (onOpen)="onKsOpen()"
                  (onPreview)="onKsPreview()"
                  (onRemove)="onKsRemove()"
                >
                </app-action-bar>
              </div>
            </div>

            <div class="col-12 lg:col-6">
              <form [formGroup]="form">
                <div class="p-fluid grid">
                  <div class="field w-full col-12">
                    <input
                      id="_ksTitle"
                      type="text"
                      class="text-2xl"
                      pInputText
                      required
                      minlength="3"
                      formControlName="title"
                    />
                  </div>

                  <div class="field col-12">
                    <p-chips
                      [allowDuplicate]="false"
                      [addOnBlur]="true"
                      [addOnTab]="true"
                      (onChipClick)="onTopicClick($event)"
                      formControlName="topics"
                      placeholder="Start typing to add a topic..."
                    >
                    </p-chips>
                  </div>

                  <div class="field p-float-label col-12 mt-4">
                    <input
                      id="ksId"
                      type="text"
                      class="w-full"
                      pInputText
                      disabled
                      [value]="ks.id.value"
                    />
                    <label for="ksId">Source ID</label>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </p-panel>

        <p-panel class="ks-description-panel col-12" [toggleable]="true">
          <ng-template pTemplate="header">
            <div
              class="flex flex-row justify-content-between align-items-center w-full"
            >
              <div class="font-bold">Description</div>
              <!-- Buttons to switch between markdown preview and editable form -->
              <div class="align-items-center">
                <button
                  pButton
                  icon="pi pi-eye"
                  class="p-button-sm p-button-rounded p-button-text"
                  [disabled]="showMarkdownPreview"
                  (click)="showMarkdownPreview = true"
                ></button>
                <button
                  pButton
                  icon="pi pi-pencil"
                  class="p-button-sm p-button-rounded p-button-text"
                  pTooltip="Edit Markdown"
                  tooltipPosition="left"
                  [disabled]="!showMarkdownPreview"
                  (click)="showMarkdownPreview = false"
                ></button>
              </div>
            </div>
          </ng-template>
          <div class="flex flex-column w-full">
            <div class="field col-12 surface-ground">
              <form [formGroup]="form">
                <div
                  *ngIf="showMarkdownPreview"
                  class="ks-description"
                  [innerHTML]="ks.description | markdown : ks.topics"
                ></div>
                <textarea
                  pInputTextarea
                  id="_ksDescription"
                  *ngIf="!showMarkdownPreview"
                  [autoResize]="true"
                  class="w-full overflow-y-auto ks-description"
                  placeholder="Description"
                  formControlName="description"
                >
                </textarea>
              </form>
            </div>
          </div>
        </p-panel>

        <p-panel
          header="Chat"
          class="col-12"
          [toggleable]="true"
          toggler="header"
          [(collapsed)]="collapsed.chat"
        >
          <div class="flex flex-column flex-auto surface-section">
            <div class="col-12">
              <app-chat-view
                #chatView
                [history]="chatHistory"
                [loading]="loading"
                [chatPrintConfig]="{
                  filename: 'chat-' + ks.id.value + '.png',
                  divId: 'chat-history-' + ks.id.value
                }"
                [heightRestricted]="true"
                [suggestions]="
                  ks.ingestType !== 'file' || chatHistory.length > 2
                "
                (onSubmit)="chatMessage($event)"
                (onDeleteMessage)="onDelete($event)"
                (onRegenerateMessage)="onRegenerate($event)"
              >
              </app-chat-view>
            </div>
          </div>
        </p-panel>

        <p-panel
          header="PDF"
          *ngIf="ksIsPdf"
          class="col-12"
          #pdfPanel
          [(collapsed)]="collapsed.pdf"
          [toggleable]="true"
          toggler="header"
        >
          <ng-template pTemplate="icons">
            <button
              pButton
              class="p-panel-header-icon"
              icon="pi pi-external-link"
              (click)="onKsOpen()"
            ></button>
          </ng-template>

          <ng-template pTemplate="content">
            <div
              *ngIf="ksIsPdf"
              class="flex-col-center-start h-full surface-section"
            >
              <embed
                *ngIf="safeUrl && this.allowCollapsedContent"
                [src]="safeUrl"
                class="p-fluid"
                [style]="{ width: '100%', height: '65vh' }"
              />
            </div>
          </ng-template>
        </p-panel>

        <p-panel
          header="YouTube Video"
          *ngIf="this.ksIsYoutubeVideo"
          class="col-12"
          [(collapsed)]="collapsed.youtube"
          [toggleable]="true"
          toggler="header"
          (onAfterToggle)="youtubeToggle($event)"
        >
          <ng-template pTemplate="icons">
            <button
              pButton
              class="p-panel-header-icon"
              icon="pi pi-external-link"
              (click)="onKsOpen()"
            ></button>
          </ng-template>
          <ng-template pTemplate="content">
            <div class="p-fluid w-full flex-row-center-center surface-section">
              <youtube-player
                *ngIf="this.ksIsYoutubeVideo && this.allowCollapsedContent"
                [videoId]="ksYoutubeVideoId"
                #youtubePlayer
              >
              </youtube-player>
            </div>
          </ng-template>
        </p-panel>

        <p-panel
          header="Project"
          *ngIf="ks.associatedProject && ks.associatedProject.value.length"
          class="col-12"
          [toggleable]="true"
          toggler="header"
          [(collapsed)]="collapsed.project"
        >
          <div class="h-full w-full surface-section">
            <div class="w-full flex flex-row flex-auto">
              <div class="p-fluid grid w-full">
                <div
                  class="col-2 lg:col-1 field p-float-label mt-5 flex-row-center-between"
                >
                  <button
                    pButton
                    class="p-button-text"
                    icon="pi pi-reply"
                    label="Move"
                    (click)="onMove()"
                  ></button>
                </div>
                <div
                  class="field p-float-label col mt-5 flex-row-center-between"
                >
                  <input
                    id="projectName"
                    type="text"
                    pInputText
                    disabled
                    [ngModel]="ks.associatedProject.value | projectName"
                  />
                  <label for="projectName">Project Name</label>
                </div>
                <div
                  class="col-1 field p-float-label mt-5 flex-row-center-between"
                >
                  <button
                    pButton
                    class="p-button-text"
                    icon="pi pi-arrow-circle-right"
                    (click)="onGoToProject()"
                  ></button>
                </div>
                <div class="field p-float-label col mt-5">
                  <input
                    id="projectName"
                    type="text"
                    pInputText
                    disabled
                    [ngModel]="ks.associatedProject.value"
                  />
                  <label for="projectName">Project Id</label>
                </div>
              </div>
            </div>
          </div>
        </p-panel>

        <p-panel
          header="Timeline"
          class="col-12"
          [toggleable]="true"
          toggler="header"
          [(collapsed)]="collapsed.timeline"
        >
          <div class="flex flex-column flex-auto surface-section">
            <div class="calendar-actions-container col-4">
              <div class="p-inputgroup">
                <button
                  pButton
                  icon="pi pi-calendar-plus"
                  (click)="dueDateCal.toggle()"
                  pTooltip="Select a date and time when {{ ks.title }} is due."
                ></button>
                <p-calendar
                  [(ngModel)]="ks.dateDue"
                  #dueDateCal
                  class="p-fluid"
                  appendTo="body"
                  placeholder="Due Date"
                  (ngModelChange)="onDueDate($event)"
                  [showOtherMonths]="true"
                  [numberOfMonths]="1"
                  [monthNavigator]="true"
                  [showIcon]="false"
                  [showTime]="true"
                  [showButtonBar]="true"
                  [hideOnDateTimeSelect]="false"
                  hourFormat="12"
                >
                </p-calendar>
                <button
                  pButton
                  icon="pi pi-times"
                  [disabled]="!ks.dateDue"
                  (click)="onDueDate(undefined)"
                ></button>
              </div>
            </div>

            <app-timeline
              [events]="events"
              class="w-full h-full"
            ></app-timeline>
          </div>
        </p-panel>

        <p-panel
          header="Metadata"
          class="col-12"
          *ngIf="ksMetadata.length > 0"
          [toggleable]="true"
          toggler="header"
          [(collapsed)]="collapsed.metadata"
        >
          <textarea
            pInputTextarea
            id="_ksRawText"
            *ngIf="ks.rawText && ks.rawText.length > 0"
            [autoResize]="true"
            class="p-fluid w-full"
            [rows]="10"
            placeholder="Extracted Text"
            [(ngModel)]="ks.rawText"
          >
          </textarea>
          <p-table
            *ngIf="this.allowCollapsedContent"
            [value]="ksMetadata"
            [paginator]="true"
            [resizableColumns]="true"
            tableStyleClass="w-full overflow-x-auto surface-section"
            [rows]="10"
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
            <ng-template pTemplate="body" let-meta>
              <tr
                *ngIf="meta.key.length > 0 && meta.value.length > 0"
                class="cursor-pointer surface-section"
              >
                <td
                  (click)="toClipboard(meta.key)"
                  class="ks-info-table hover:surface-hover"
                >
                  {{ meta.key }}
                </td>
                <td
                  (click)="toClipboard(meta.value)"
                  class="ks-info-table hover:surface-hover"
                >
                  {{ meta.value }}
                </td>
                <td
                  (click)="toClipboard(meta.property)"
                  class="ks-info-table hover:surface-hover"
                >
                  {{ meta.property }}
                </td>
              </tr>
            </ng-template>
          </p-table>
        </p-panel>

        <p-panel
          header="Source Model"
          class="col-12"
          [toggleable]="true"
          toggler="header"
          [(collapsed)]="collapsed.sourcemodel"
        >
          <ng-template pTemplate="content">
            <div
              class="p-fluid flex flex-wrap surface-section"
              *ngIf="this.allowCollapsedContent"
            >
              <div
                class="field p-float-label sm:col-12 md:col-12 lg:col-6 mt-4"
              >
                <input
                  id="ksProject"
                  type="text"
                  pInputText
                  disabled
                  [value]="ks.associatedProject.value"
                />
                <label for="ksProject">Associated Project ID</label>
              </div>

              <div
                class="field p-float-label sm:col-12 md:col-12 lg:col-6 mt-4"
              >
                <input
                  id="ingestType"
                  type="text"
                  pInputText
                  disabled
                  [value]="ks.ingestType | titlecase"
                />
                <label for="ingestType">Ingest Type</label>
              </div>

              <div
                class="field p-float-label sm:col-12 md:col-12 lg:col-6 mt-4"
              >
                <input
                  id="importMethod"
                  type="text"
                  pInputText
                  disabled
                  [value]="ks.importMethod | importMethod"
                />
                <label for="importMethod">Import Method</label>
              </div>

              <div
                class="field p-float-label sm:col-12 md:col-12 lg:col-6 mt-4"
              >
                <input
                  id="ksTitle"
                  type="text"
                  pInputText
                  disabled
                  [value]="ks.icon"
                />
                <label for="ksTitle">Icon Encoding</label>
              </div>

              <div
                class="field p-float-label sm:col-12 md:col-12 lg:col-6 mt-4"
              >
                <input
                  id="iconUrl"
                  type="text"
                  pInputText
                  disabled
                  [value]="ks.iconUrl"
                />
                <label for="iconUrl">Icon URL</label>
              </div>

              <div
                class="field p-float-label sm:col-12 md:col-12 lg:col-6 mt-4 p-fluid p-inputgroup"
              >
                <input
                  id="accessLink"
                  type="text"
                  pInputText
                  disabled
                  [value]="ks.accessLink"
                  style="width: calc(100% - 6rem)"
                />
                <label for="accessLink">Access Link</label>
                <button
                  pButton
                  style="width: 6rem"
                  *ngIf="ks.ingestType === 'file'"
                  label="Show"
                  (click)="show(ks.accessLink)"
                ></button>
              </div>
            </div>
          </ng-template>
        </p-panel>
      </div>
    </p-scrollPanel>
  `,
  styles: [
    `
      .ks-info-details {
        width: 100%;
        padding: 10px;
        max-height: 100%;
        overflow-x: hidden;
        overflow-y: auto;
      }

      .ks-info-table {
        overflow: hidden !important;
        overflow-wrap: anywhere !important;
        white-space: unset !important;
      }

      .ks-description {
        min-height: 8rem;
        max-height: 48rem;
        overflow-y: auto;
      }
    `,
  ],
})
export class KsInfoComponent implements OnChanges, OnDestroy {
  @ViewChild('chatView') chatView!: ChatViewComponent;

  /**
   * The knowledge source to display
   * @type {KnowledgeSource}
   * @memberof KsInfoComponent
   * @required
   * @default null
   */
  @Input() ks!: KnowledgeSource;

  /**
   * Used to collapse or expand all panels
   *
   * @type {boolean}
   * @memberof KsInfoComponent
   * @default false
   * @optional
   */
  @Input() collapseAll = false;

  /**
   * Whether or not this component is being used in a dialog
   *
   * @type {boolean}
   * @memberof KsInfoComponent
   * @default false
   * @optional
   * @description If this component is being used in a dialog, the dialog will be closed when the user clicks the close button
   */
  @Input() isDialog = false;

  /**
   * Event emitted when the user clicks the delete button
   *
   * @type {EventEmitter<KnowledgeSource>}
   * @memberof KsInfoComponent
   * @optional
   * @description The knowledge source that was deleted will be emitted
   */
  @Output() onRemove = new EventEmitter<KnowledgeSource>();

  /**
   * Event emitted when the source is updated or changed in some way
   *
   * @type {EventEmitter<KnowledgeSource>}
   * @memberof KsInfoComponent
   * @optional
   * @description The knowledge source that was updated will be emitted
   */
  @Output() onSaved = new EventEmitter<KnowledgeSource>();

  /**
   * Event emitted when the user clicks the close button
   *
   * @type {EventEmitter<KnowledgeSource>}
   * @memberof KsInfoComponent
   * @optional
   * @description The knowledge source that was closed will be emitted
   */
  @Output() shouldClose = new EventEmitter<KnowledgeSource>();

  /**
   * Instance of the YouTube player for easier reference and control
   * @type {YouTubePlayer}
   * @memberof KsInfoComponent
   * @optional
   * @description This is used to control the YouTube player
   */
  @ViewChild('youtubePlayer') ksYoutubePlayer!: YouTubePlayer;

  /**
   * Calendar events for the source
   * @type {any[]}
   * @memberof KsInfoComponent
   * @optional
   * @description This is used to display the calendar events for the source
   */
  events: any[] = [];

  /**
   * Whether or not the source is a YouTube video
   * @type {boolean}
   * @memberof KsInfoComponent
   * @default false
   * @optional
   * @description This is used to determine if the YouTube player should be loaded
   */
  ksIsYoutubeVideo = false;

  /**
   * The ID of the YouTube video if the source is a YouTube video
   * @type {string}
   * @memberof KsInfoComponent
   * @optional
   * @description This is used to load the YouTube player
   */
  ksYoutubeVideoId = '';

  /**
   * Whether or not the YouTube player has been loaded
   * @type {boolean}
   * @memberof KsInfoComponent
   * @default false
   * @optional
   * @description This is used to prevent the YouTube player from loading multiple times
   */
  apiLoaded = false;

  /**
   * If the source is a file, this will be the configuration for the file view
   * @type {FileViewConfig}
   * @memberof KsInfoComponent
   * @optional
   */
  fileConfig?: FileViewConfig;

  /**
   * If the source is a file, this will be the URL to the file
   * @type {SafeUrl}
   * @memberof KsInfoComponent
   * @optional
   * @description This will be sanitized to prevent XSS attacks
   */
  safeUrl?: SafeUrl | null;

  /**
   * If the source is a website, this will contain the metadata for the website
   * @type {WebsiteMetaTagsModel[]}
   * @memberof KsInfoComponent
   * @optional
   * @description This will be sanitized to prevent XSS attacks
   */
  ksMetadata: WebsiteMetaTagsModel[] = [];

  /**
   * Whether or not the panels can be collapsed
   * @type {boolean}
   * @memberof KsInfoComponent
   * @default false
   */
  allowCollapsedContent = false;

  /**
   * Whether or not the panels are collapsed
   * @type {CollapseState}
   * @memberof KsInfoComponent
   * @default false
   * @description This is used to collapse or expand all panels
   */
  collapsed: CollapseState = new CollapseState(false);

  /**
   * Whether or not the chat is loading
   * @type {boolean}
   * @memberof KsInfoComponent
   * @default false
   * @description This is used to display a loading indicator
   */
  loading = false;

  /**
   * The form used for various source fields
   * @type {FormGroup}
   * @memberof KsInfoComponent
   * @optional
   * @description This is used to display the source fields
   */
  form: FormGroup;

  /**
   * Whether or not the source is a PDF
   * @type {boolean}
   * @memberof KsInfoComponent
   * @default false
   * @optional
   * @description This is used to determine if the PDF viewer should be loaded
   */
  ksIsPdf = false;

  /**
   * The chat history for the source
   * @type {ChatMessage[]}
   * @memberof KsInfoComponent
   * @optional
   * @description This is used to display the chat history for the source
   */
  chatHistory: ChatMessage[] = [];
  /**
   * Whether or not to display the description as markdown or as an editable field
   */
  showMarkdownPreview = true;
  /**
   * A subject used to unsubscribe from all subscriptions when the component is destroyed
   * @type {Subject<any>}
   * @memberof KsInfoComponent
   * @optional
   * @private
   */
  private cleanUp: Subject<any> = new Subject<any>();
  /**
   * If the source is a YouTube video, this will determine if the video should play automatically
   * @type {boolean}
   * @memberof KsInfoComponent
   * @default true
   * @optional
   */
  private autoplay = true;

  /**
   * Creates an instance of KsInfoComponent.
   * @param {DomSanitizer} sanitizer Used to sanitize the URL for the source
   * @param {ChatService} chat Used to send messages to the chat
   * @param {BrowserViewDialogService} browser Used to open the browser view dialog
   * @param {Clipboard} clipboard Used to copy text to the clipboard
   * @param {ElectronIpcService} ipc Used to send messages to the main process
   * @param {Router} router Used to navigate to other routes
   * @param {TopicService} topics Used to get the list of topics
   * @param {NotificationsService} notifications Used to send notifications
   * @param {FormBuilder} formBuilder Used to build the form
   * @param {SourceChatService} sourceChat Used to get the chat history for the source
   * @param {KsCommandService} command Used to send commands about the source
   * @param {SettingsService} settings Used to get the autoplay setting
   */
  constructor(
    private sanitizer: DomSanitizer,
    private chat: ChatService,
    private browser: BrowserViewDialogService,
    private clipboard: Clipboard,
    private ipc: ElectronIpcService,
    private router: Router,
    private topics: TopicService,
    private notifications: NotificationsService,
    private formBuilder: FormBuilder,
    private sourceChat: SourceChatService,
    private command: KsCommandService,
    private settings: SettingsService,
    private uuid: UuidService
  ) {
    /**
     * Listen for the autoplay setting and update the local value when it changes
     */
    settings.display
      .pipe(
        takeUntil(this.cleanUp),
        tap((displaySettings) => {
          this.autoplay = displaySettings.autoplay;
        })
      )
      .subscribe();

    /**
     * Create the form for the source fields and set the initial values
     */
    this.form = formBuilder.group({
      id: '',
      title: [''],
      description: [''],
      topics: [],
    });

    /**
     * When the form changes, update the knowledge source
     */
    this.form.valueChanges
      .pipe(
        skip(1),
        takeUntil(this.cleanUp),
        debounceTime(this.isDialog ? 2500 : 1000),
        distinctUntilChanged((prev, curr) => {
          if (curr.title.length <= 3) {
            return true;
          }

          return (
            prev.title === curr.title &&
            prev.description === curr.description &&
            JSON.stringify(prev.topics) === JSON.stringify(curr.topics)
          );
        }),
        tap((formValue) => {
          const ksEvent: KnowledgeSourceEvent = {
            date: new Date(),
            label: 'Updated',
          };
          if (!this.ks.events) {
            this.ks.events = [];
          }
          this.ks.events.push(ksEvent);

          this.ks.title = formValue.title;
          this.ks.description = formValue.description;
          this.ks.topics = formValue.topics;

          // If the knowledge source has an associated project, update it.
          if (
            this.ks.associatedProject &&
            this.ks.associatedProject.value.length > 0
          ) {
            this.command.update([this.ks], !this.isDialog);
            this.onSaved.emit(this.ks);
          }
        })
      )
      .subscribe();
  }

  /**
   * Reset the component to its initial state
   */
  reset() {
    this.ksIsYoutubeVideo = false;
    this.ksYoutubeVideoId = '';
    this.ksIsPdf = false;
    this.safeUrl = undefined;
    this.fileConfig = undefined;
    this.chatHistory = [];
    this.collapsed = new CollapseState(false);
  }

  /**
   * Set all the panels to be expanded
   */
  onExpandAll() {
    this.collapsed = new CollapseState(false);
  }

  /**
   * Set all the panels to be collapsed
   */
  onCollapseAll() {
    this.collapsed = new CollapseState(true);
  }

  /**
   * Monitor changes to the input properties and respond accordingly
   * @param {SimpleChanges} changes
   * @memberof KsInfoComponent
   * @description If the collapseAll input changes, then collapse or expand all the panels accordingly
   * @description If the knowledge source changes, then reset the component and populate the calendar and chat history
   */
  ngOnChanges(changes: SimpleChanges) {
    // If the collapseAll input changes, then collapse or expand all the panels accordingly
    try {
      if (
        changes.collapseAll &&
        changes.collapseAll.currentValue !== undefined
      ) {
        if (changes.collapseAll.currentValue === true) {
          this.onCollapseAll();
        } else if (changes.collapseAll.currentValue === false) {
          this.onExpandAll();
        }
      }
    } catch (e) {
      this.notifications.error('Source Info', 'Change Control Error', `${e}`);
    }

    // If the knowledge source changes, then reset the component and populate the calendar and chat history
    try {
      if (changes.ks && changes.ks.currentValue) {
        this.reset();

        this.ksMetadata =
          this.ks.reference.source.website?.metadata?.meta ?? [];

        const ks: KnowledgeSource = this.ks;
        this.populateCalendar(ks);
        this.getChatHistory(ks);

        if (!ks.importMethod) {
          ks.importMethod = 'manual';
        }

        if (ks.ingestType === 'website') {
          ks.accessLink = new URL(ks.accessLink);
          const urlParam = ks.accessLink.searchParams.get('v');

          // If the knowledge source is a YouTube video, we need to set the video ID, generate a safe URL, and set the API loaded flag
          if (ks.accessLink.hostname === 'www.youtube.com' && urlParam) {
            this.ksIsYoutubeVideo = true;
            this.ksYoutubeVideoId = urlParam;
            if (!this.apiLoaded) {
              // This code loads the IFrame Player API code asynchronously, according to the instructions at
              // https://developers.google.com/youtube/iframe_api_reference#Getting_Started
              const tag = document.createElement('script');
              tag.src = 'https://www.youtube.com/iframe_api';
              document.body.appendChild(tag);
              this.apiLoaded = true;
            }
          }

          const sanitized = this.sanitizer.sanitize(
            SecurityContext.URL,
            ks.accessLink
          );
          if (sanitized) {
            this.safeUrl =
              this.sanitizer.bypassSecurityTrustResourceUrl(sanitized);
          }
        }

        // If the knowledge source is a file, we need to set the file path, generate a safe URL, and set the PDF flag
        if (ks.ingestType === 'file') {
          this.fileConfig = {
            filePath: ks.reference.source.file?.path ?? '',
          };

          if (typeof ks.accessLink === 'string') {
            this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
              'file://' + encodeURI(ks.accessLink)
            );
          }

          this.ksIsPdf =
            this.ks.reference.source.file?.type.includes('pdf') ?? false;
        }

        // Make sure the form is updated with the latest data
        this.form.patchValue({
          id: ks.id.value,
          title: ks.title,
          description: ks.description,
          topics: ks.topics,
        });

        setTimeout(() => {
          this.allowCollapsedContent = true;
        }, 500);
      }
    } catch (e) {
      this.notifications.error('Source Info', 'Change Control Error', `${e}`);
    }
  }

  /**
   * Clean up subscriptions when the component is destroyed
   */
  ngOnDestroy() {
    this.cleanUp.next({});
    this.cleanUp.complete();
  }

  /**
   * Get the chat history for the given Source, create a new chat if there is no history
   * and send a message to the Source agent asking for an introduction
   *
   * @param {KnowledgeSource} source
   * @memberof KsInfoComponent
   * @description If there is no chat history, create a new chat and introduce the Source
   */
  getChatHistory(source: KnowledgeSource) {
    // Get chat history for this Source
    this.chatHistory = this.chat.loadChat(source.id, undefined, source);

    // If no chat history, create a new chat and introduce the Source
    if (this.chatHistory.length === 0 && source.ingestType !== 'file') {
      this.loading = true;
      this.chatHistory = [
        {
          id: this.uuid.generate(1)[0].value,
          timestamp: new Date(),
          text: `Can you introduce me to "${source.title}"?`,
          sender: AgentType.User,
          recipient: AgentType.Source,
          source: source,
        },
      ];

      // Send to API asking for an introduction to the Source
      this.chat
        .intro(source)
        .pipe(
          take(1),
          tap((chat) => {
            if (!chat || !chat.answer) return;

            // Add chat to history
            this.chatHistory.push({
              id: this.uuid.generate(1)[0].value,
              timestamp: new Date(),
              text: `${chat.answer}`,
              sender: AgentType.Source,
              recipient: AgentType.User,
              source: source,
            });

            this.chat.saveChat(this.chatHistory, this.ks.id);
          }),
          finalize(() => {
            this.loading = false;
          })
        )
        .subscribe();
    }
  }

  /**
   * Populate the calendar with the dateModified, dateAccessed, and other events
   *
   * @param {KnowledgeSource} ks
   * @memberof KsInfoComponent
   */
  populateCalendar(ks: KnowledgeSource) {
    this.events = [];

    // Add dateModified to calendar
    for (const mod of this.ks.dateModified) {
      this.events.push({
        status: 'Modified',
        date: mod,
      });
    }

    // Add dateAccessed to calendar
    for (const access of this.ks.dateAccessed) {
      this.events.push({
        status: 'Accessed',
        date: access,
      });
    }

    // Create events array if it doesn't exist
    if (!this.ks.events) {
      this.ks.events = [];
    }

    // Add events to calendar
    for (const event of this.ks.events) {
      this.events.push({
        status: event.label,
        date: event.date,
      });
    }

    // Sort events by date
    this.events.sort((a, b) => {
      a = new Date(a.date);
      b = new Date(b.date);
      if (a < b) return -1;
      if (a > b) return 1;
      return 0;
    });

    // Make sure dateDue is a Date object
    if (ks.dateDue) {
      ks.dateDue = new Date(ks.dateDue);
    } else {
      ks.dateDue = undefined;
    }
  }

  /**
   * When the user clicks on a topic, use the search service to search for it
   *
   * @param {any} $event
   * @memberof KsInfoComponent
   */
  onTopicClick($event: any) {
    if (!$event.value) {
      return;
    }

    this.topics.search($event.value);
  }

  /**
   * When the open button is clicked, use the command service to open the knowledge source
   */
  onKsOpen() {
    this.command.open(this.ks);
  }

  /**
   * When the preview button is clicked, use the command service to preview the knowledge source
   */
  onKsPreview() {
    this.command.preview(this.ks);
  }

  /**
   * When the remove button is clicked, use the command service to remove the knowledge source
   */
  onKsRemove() {
    if (
      this.ks.associatedProject &&
      this.ks.associatedProject.value.length > 0
    ) {
      this.command.remove([this.ks]);
    }
    this.onRemove.emit(this.ks);
    this.shouldClose.emit();
  }

  /**
   * Pause/Play the video when the panel is collapsed/expanded, respectively
   *
   * @param {any} $event
   * @memberof KsInfoComponent
   * @description If autoplay is enabled, the video will play when the panel is expanded
   * @description If autoplay is disabled, the video will not play when the panel is expanded
   */
  youtubeToggle($event: any) {
    if (!this.ksYoutubePlayer) {
      return;
    }
    try {
      if ($event.collapsed === true) {
        this.ksYoutubePlayer.pauseVideo();
      } else if (this.autoplay) {
        this.ksYoutubePlayer.playVideo();
      }
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * When the user clicks on the "go-to project" button, navigate to the project
   */
  onGoToProject() {
    this.router.navigate(['app', 'projects', this.ks.associatedProject.value]);
    this.shouldClose.emit();
  }

  /**
   * When the source is updated, alert the command service and any listeners
   *
   * @memberof KsInfoComponent
   * @description If the source is not associated with a project, do not update
   */
  update() {
    if (
      this.ks.associatedProject &&
      this.ks.associatedProject.value.length > 0
    ) {
      this.command.update([this.ks], !this.isDialog);
      this.onSaved.emit(this.ks);
    }
  }

  /**
   * When the user flags or unflags the source, update the value and alert the command service
   *
   * @param {any} $event
   * @memberof KsInfoComponent
   */
  onFlagged($event: any) {
    this.ks.flagged = $event.checked ?? false;
    this.update();
  }

  /**
   * When the user changes the due date, update the value and alert the command service
   *
   * @param {any} $event
   * @memberof KsInfoComponent
   */
  onDueDate($event: any) {
    this.ks.dateDue = $event;
    this.update();
  }

  /**
   * When the user clicks on the "move" button, alert the command service
   */
  onMove() {
    this.command.move([this.ks]);
  }

  /**
   * When the user clicks on the "Open In..." button, use Electron IPC to show the source in the file manager
   *
   * @param {URL | string} accessLink
   * @memberof KsInfoComponent
   * @description If the accessLink is a string, use the IPC to show the item in the file manager,
   *  otherwise it's a URL and therefore cannot be viewed in the file manager.
   */
  show(accessLink: URL | string) {
    if (typeof accessLink === 'string') {
      this.ipc.showItemInFolder(accessLink);
      this.notifications.debug(
        'Source Info',
        'Locating Folder',
        location,
        'toast'
      );
    }
  }

  /**
   * When the user clicks on the "Copy" button, copy the source key to the clipboard
   *
   * @param {string} key
   * @memberof KsInfoComponent
   * @description If the key is not empty, copy it to the clipboard and alert the user
   */
  toClipboard(key: string) {
    if (key && key.trim().length > 0) {
      this.clipboard.copy(key);
      this.notifications.success('Source Info', 'Copied!', key);
    }
  }

  /**
   * When a new chat message is sent, send it to the source chat service
   *
   * @param {string} $event
   * @memberof KsInfoComponent
   */
  chatMessage($event: string) {
    console.log('Sending chat message: ', $event);
    this.loading = true;
    this.chatHistory.push({
      id: this.uuid.generate(1)[0].value,
      timestamp: new Date(),
      text: $event,
      sender: AgentType.User,
      recipient: AgentType.Source,
      source: this.ks,
    });
    this.sourceChat
      .send(this.ks, this.chatHistory, $event)
      .pipe(
        timeout(20000),
        take(1),
        tap((response: ChatCompletionResponseMessage) => {
          console.log('Chat response', response.content);
          this.chatHistory.push({
            id: this.uuid.generate(1)[0].value,
            timestamp: new Date(),
            text: response.content,
            sender: AgentType.Knowledge,
            recipient: AgentType.User,
            source: this.ks,
          });
          this.chat.saveChat(this.chatHistory, this.ks.id);
          this.chatView.scroll();
        }),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe();
  }

  onRegenerate(message: ChatMessage) {
    this.loading = true;

    // First, get the message that was responded to
    const messageIndex = this.chatHistory.findIndex((m) => m.id === message.id);

    // Use the message index to get the history up to that point
    const historySlice = this.chatHistory.slice(0, messageIndex);

    // Create a new message with the same text as the message that was responded to
    const promptMessage = historySlice[historySlice.length - 1];

    this.sourceChat
      .send(this.ks, this.chatHistory, promptMessage.text)
      .pipe(
        timeout(20000),
        take(1),
        tap((response: ChatCompletionResponseMessage) => {
          message.text = response.content;
          message.timestamp = new Date();
          this.chat.saveChat(this.chatHistory, this.ks.id);
        }),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe();
  }

  /**
   * When the user clicks on the "Delete" button, delete the message from the chat history
   *
   * @param {ChatMessage} message
   * @memberof KsInfoComponent
   */
  onDelete(message: ChatMessage) {
    this.chatHistory = this.chatHistory.filter((msg) => msg.id !== message.id);
    this.chat.saveChat(this.chatHistory, this.ks.id);
  }
}
