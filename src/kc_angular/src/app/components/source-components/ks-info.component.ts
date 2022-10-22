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
import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SecurityContext, SimpleChanges, ViewChild} from '@angular/core';
import {KnowledgeSource, KnowledgeSourceEvent} from "src/app/models/knowledge.source.model";
import {DomSanitizer, SafeUrl} from "@angular/platform-browser";
import {FileViewConfig} from "../../../../../kc_shared/models/browser.view.model";
import {BrowserViewDialogService} from "../../services/ipc-services/browser-view-dialog.service";
import {WebsiteMetaTagsModel} from "../../../../../kc_shared/models/web.source.model";
import {KsCommandService} from "../../services/command-services/ks-command.service";
import {YouTubePlayer} from "@angular/youtube-player";
import {Router} from "@angular/router";
import {TopicService} from "../../services/user-services/topic.service";
import {FormBuilder, FormGroup} from "@angular/forms";
import {debounceTime, distinctUntilChanged} from "rxjs/operators";
import {ElectronIpcService} from "../../services/ipc-services/electron-ipc.service";
import {NotificationsService} from "../../services/user-services/notifications.service";
import {Clipboard} from "@angular/cdk/clipboard";

@Component({
  selector: 'app-ks-info',
  template: `
    <p-scrollPanel class="w-full h-full">
      <div class="p-fluid grid">
        <p-panel header="Details" class="col-12" [toggleable]="true" [collapsed]="collapseDetails" toggler="header">
          <div class="w-full h-full flex flex-wrap surface-section p-2">
            <div class="col-12 lg:col-6">
              <div class="flex flex-row flex-auto w-full">
                <app-ks-thumbnail [ks]="ks" class="col-12 border-1 border-dashed border-100 border-round"></app-ks-thumbnail>
              </div>
              <div class="flex flex-row flex-auto w-full">
                <app-action-bar class="w-full p-fluid"
                                [showEdit]="false"
                                [showFlag]="true"
                                [flagged]="ks.flagged"
                                (onFlagged)="onFlagged($event)"
                                (onOpen)="onKsOpen()"
                                (onPreview)="onKsPreview()"
                                (onRemove)="onKsRemove()">
                </app-action-bar>
              </div>
            </div>

            <div class="col-12 lg:col-6">
              <form [formGroup]="form">
                <div class="p-fluid grid">

                  <div class="field w-full col-12">
                    <input id="_ksTitle"
                           type="text"
                           class="text-2xl"
                           pInputText
                           required
                           minlength="3"
                           formControlName="title">
                  </div>

                  <div class="field col-12">
                    <textarea pInputTextarea id="_ksDescription"
                              [autoResize]="true"
                              class="p-fluid"
                              style="max-height: 8rem"
                              placeholder="Description"
                              formControlName="description">
                    </textarea>
                  </div>

                  <div class="field col-12">
                    <p-chips [max]="5"
                             [allowDuplicate]="false"
                             [addOnBlur]="true"
                             [addOnTab]="true"
                             (onChipClick)="onTopicClick($event)"
                             formControlName="topics"
                             placeholder="Start typing to add a topic...">
                    </p-chips>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </p-panel>

        <p-panel *ngIf="ksIsPdf"
                 class="col-12"
                 #pdfPanel
                 header="PDF"
                 [collapsed]="collapsePdf"
                 [toggleable]="true"
                 toggler="header"
                 (onAfterToggle)="onPdfToggle($event)">
          <ng-template pTemplate="icons">
            <button pButton class="p-panel-header-icon" icon="pi pi-external-link" (click)="onKsOpen()"></button>
          </ng-template>

          <ng-template pTemplate="content">
            <div *ngIf="ksIsPdf" class="flex-col-center-start h-full surface-section">
              <embed *ngIf="safeUrl && this.allowCollapsedContent" [src]="safeUrl" class="p-fluid"
                     [style]="{width: '100%', 'height': '65vh'}">
            </div>
          </ng-template>
        </p-panel>

        <p-panel *ngIf="this.ksIsYoutubeVideo"
                 class="col-12"
                 header="YouTube Video"
                 [collapsed]="collapseYouTube"
                 [toggleable]="true"
                 toggler="header"
                 (onAfterToggle)="youtubeToggle($event)">
          <ng-template pTemplate="icons">
            <button pButton
                    class="p-panel-header-icon"
                    icon="pi pi-external-link"
                    (click)="onKsOpen()">
            </button>
          </ng-template>
          <ng-template pTemplate="content">
            <div class="p-fluid w-full flex-row-center-center surface-section">
              <youtube-player *ngIf="this.ksIsYoutubeVideo && this.allowCollapsedContent"
                              [videoId]="ksYoutubeVideoId"
                              #youtubePlayer>
              </youtube-player>
            </div>
          </ng-template>
        </p-panel>

        <p-panel header="Project"
                 *ngIf="ks.associatedProject && ks.associatedProject.value.length"
                 class="col-12"
                 [toggleable]="true"
                 toggler="header"
                 [collapsed]="collapseProject">
          <div class="h-full w-full surface-section">
            <div class="w-full flex flex-row flex-auto">
              <div class="p-fluid grid w-full">
                <div class="col-2 lg:col-1 field p-float-label mt-5 flex-row-center-between">
                  <button pButton class="p-button-text"
                          icon="pi pi-reply"
                          label="Move"
                          (click)="onMove()">
                  </button>
                </div>
                <div class="field p-float-label col mt-5 flex-row-center-between">
                  <input id="projectName"
                         type="text"
                         pInputText
                         disabled
                         [ngModel]="ks.associatedProject.value | projectName">
                  <label for="projectName">Project Name</label>
                </div>
                <div class="col-1 field p-float-label mt-5 flex-row-center-between">
                  <button pButton class="p-button-text" icon="pi pi-arrow-circle-right" (click)="onGoToProject($event)"></button>
                </div>
                <div class="field p-float-label col mt-5">
                  <input id="projectName" type="text" pInputText disabled
                         [ngModel]="ks.associatedProject.value">
                  <label for="projectName">Project Id</label>
                </div>
              </div>
            </div>
          </div>
        </p-panel>

        <p-panel header="Timeline"
                 class="col-12"
                 [toggleable]="true"
                 toggler="header"
                 [collapsed]="collapseTimeline">
          <div class="flex flex-column flex-auto surface-section">
            <div class="calendar-actions-container col-4">
              <div class="p-inputgroup">
                <button pButton icon="pi pi-calendar-plus" (click)="dueDateCal.toggle()"
                        pTooltip="Select a date and time when {{ks.title}} is due.">
                </button>
                <p-calendar [(ngModel)]="ks.dateDue"
                            #dueDateCal
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
                            hourFormat="12">
                </p-calendar>
                <button pButton icon="pi pi-times" [disabled]="!ks.dateDue" (click)="onDueDate(undefined)"></button>
              </div>
            </div>

            <app-timeline [events]="events" class="w-full h-full"></app-timeline>
          </div>
        </p-panel>

        <p-panel header="Metadata" class="col-12"
                 *ngIf="ksMetadata.length > 0"
                 [toggleable]="true"
                 toggler="header"
                 [collapsed]="collapseExtraction">
          <textarea pInputTextarea id="_ksRawText"
                    *ngIf="ks.rawText && ks.rawText.length > 0"
                    [autoResize]="true"
                    class="p-fluid w-full"
                    [rows]="10"
                    placeholder="Extracted Text"
                    [(ngModel)]="ks.rawText">
          </textarea>
          <p-table *ngIf="this.allowCollapsedContent"
                   [value]="ksMetadata"
                   [paginator]="true"
                   [resizableColumns]="true"
                   tableStyleClass="w-full overflow-x-auto surface-section"
                   [rows]="10">
            <ng-template pTemplate="header">
              <tr>
                <th class="ks-info-table" pSortableColumn="key">Key
                  <p-sortIcon field="key"></p-sortIcon>
                </th>
                <th class="ks-info-table" pSortableColumn="value">Value
                  <p-sortIcon field="value"></p-sortIcon>
                </th>
                <th class="ks-info-table" pSortableColumn="property">Property
                  <p-sortIcon field="property"></p-sortIcon>
                </th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-meta>
              <tr *ngIf="meta.key.length > 0 && meta.value.length > 0" class="cursor-pointer surface-section">
                <td (click)="toClipboard(meta.key)" class="ks-info-table hover:surface-hover">{{meta.key}}</td>
                <td (click)="toClipboard(meta.value)" class="ks-info-table hover:surface-hover">{{meta.value}}</td>
                <td (click)="toClipboard(meta.property)" class="ks-info-table hover:surface-hover">{{meta.property}}</td>
              </tr>
            </ng-template>
          </p-table>
        </p-panel>

        <p-panel header="Source Model"
                 class="col-12"
                 [toggleable]="true"
                 toggler="header"
                 [collapsed]="collapseSource">
          <ng-template pTemplate="content">
            <div class="p-fluid flex flex-wrap surface-section" *ngIf="this.allowCollapsedContent">
              <div class="field p-float-label sm:col-12 md:col-12 lg:col-6 mt-4">
                <input id="ksId" type="text" pInputText disabled [value]="ks.id.value">
                <label for="ksId">Source ID</label>
              </div>

              <div class="field p-float-label sm:col-12 md:col-12 lg:col-6 mt-4">
                <input id="ksProject" type="text" pInputText disabled [value]="ksAssociatedProjectId">
                <label for="ksProject">Associated Project ID</label>
              </div>

              <div class="field p-float-label sm:col-12 md:col-12 lg:col-6 mt-4">
                <input id="ingestType" type="text" pInputText disabled [value]="ks.ingestType | titlecase">
                <label for="ingestType">Ingest Type</label>
              </div>

              <div class="field p-float-label sm:col-12 md:col-12 lg:col-6 mt-4">
                <input id="importMethod" type="text" pInputText disabled [value]="ks.importMethod | importMethod">
                <label for="importMethod">Import Method</label>
              </div>

              <div class="field p-float-label sm:col-12 md:col-12 lg:col-6 mt-4">
                <input id="ksTitle" type="text" pInputText disabled [value]="ks.icon">
                <label for="ksTitle">Icon Encoding</label>
              </div>

              <div class="field p-float-label sm:col-12 md:col-12 lg:col-6 mt-4">
                <input id="iconUrl" type="text" pInputText disabled [value]="ks.iconUrl">
                <label for="iconUrl">Icon URL</label>
              </div>

              <div class="field p-float-label sm:col-12 md:col-12 lg:col-6 mt-4 p-fluid p-inputgroup">
                <input id="accessLink" type="text" pInputText disabled [value]="ks.accessLink" style="width: calc(100% - 6rem)">
                <label for="accessLink">Access Link</label>
                <button pButton
                        style="width: 6rem"
                        *ngIf="ks.ingestType === 'file'"
                        label="Show"
                        (click)="show(ks.accessLink)">
                </button>
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
    `
  ]
})
export class KsInfoComponent implements OnInit, OnChanges {
  @Input() ks!: KnowledgeSource;

  @Input() collapseAll: boolean = false;

  @Input() isDialog: boolean = false;

  @Output() onRemove = new EventEmitter<KnowledgeSource>();

  @Output() onSaved = new EventEmitter<KnowledgeSource>();

  @Output() shouldClose = new EventEmitter<KnowledgeSource>();

  @ViewChild('youtubePlayer') ksYoutubePlayer!: YouTubePlayer;

  events: any[] = [];

  ksIsYoutubeVideo: boolean = false;

  ksYoutubeVideoId: string = '';

  apiLoaded = false;

  fileConfig?: FileViewConfig;

  safeUrl?: SafeUrl | null;

  ksMetadata: WebsiteMetaTagsModel[] = [];

  allowCollapsedContent: boolean = false;

  collapseDetails: boolean = false;

  collapseTimeline: boolean = true;

  collapseYouTube: boolean = true;

  collapsePdf: boolean = true;

  collapseExtraction: boolean = true;

  collapseSource: boolean = true;

  collapseProject: boolean = true;

  form: FormGroup;

  ksIsPdf: boolean = false;

  private first: boolean = true;

  constructor(private sanitizer: DomSanitizer,
              private browser: BrowserViewDialogService,
              private clipboard: Clipboard,
              private ipc: ElectronIpcService,
              private router: Router,
              private topics: TopicService,
              private notifications: NotificationsService,
              private formBuilder: FormBuilder,
              private command: KsCommandService) {
    this.form = formBuilder.group({
      id: '',
      title: [''],
      description: [''],
      topics: []
    });

    this.form.valueChanges.pipe(
      debounceTime(this.isDialog ? 2500 : 1000),
      distinctUntilChanged((prev, curr) => {
        if (curr.title.length <= 3) {
          return true;
        }

        return (prev.title === curr.title &&
          prev.description === curr.description &&
          JSON.stringify(prev.topics) === JSON.stringify(curr.topics)
        );
      })
    ).subscribe((formValue) => {
      if (this.first) {
        this.first = false;
      } else {

        // TODO: push update to knowledge source event list (currently, `events` is not the right type...)...
        // const event: EventModel = {
        //   description: '',
        //   timestamp: Date(),
        //   type: 'update'
        // }

        const ksEvent: KnowledgeSourceEvent = {
          date: new Date(),
          label: 'Updated',
        }
        if (!this.ks.events) {
          this.ks.events = [];
        }

        this.ks.events.push(ksEvent);

        this.ks.title = this.form.get('title')?.value;
        this.ks.description = this.form.get('description')?.value;
        this.ks.topics = this.form.get('topics')?.value;

        if (this.ks.associatedProject && this.ks.associatedProject.value.length > 0) {
          this.command.update([this.ks], !this.isDialog);
          this.onSaved.emit(this.ks);
        }
      }
    })
  }

  get ksAssociatedProjectId() {
    return this.ks.associatedProject?.value ?? '';
  }

  reset() {
    this.ksIsYoutubeVideo = false;
    this.ksYoutubeVideoId = '';
    this.ksIsPdf = false;
    this.safeUrl = undefined;
    this.fileConfig = undefined;

    this.collapseDetails = false;
    this.collapseTimeline = true;
    this.collapseYouTube = true;
    this.collapsePdf = true;
    this.collapseExtraction = true;
    this.collapseSource = true;
    this.collapseProject = true;

    this.first = true;
  }

  onExpandAll() {
    this.collapseAll = false;
    this.collapseDetails = false;
    this.collapsePdf = false;
    this.collapseTimeline = false;
    this.collapseYouTube = false;
    this.collapseSource = false;
    this.collapseExtraction = false;
    this.collapseProject = false;
  }

  onCollapseAll() {
    this.collapseAll = true;
    this.collapseDetails = true;
    this.collapsePdf = true;
    this.collapseTimeline = true;
    this.collapseYouTube = true;
    this.collapseSource = true;
    this.collapseExtraction = true;
    this.collapseProject = true;
  }

  ngOnChanges(changes: SimpleChanges) {
    try {
      if (changes.collapseAll?.currentValue !== undefined) {
        if (changes.collapseAll.currentValue === true) {
          this.onCollapseAll();
        } else if (changes.collapseAll.currentValue === false) {
          this.onExpandAll();
        }
      }
    } catch (e) {
      this.notifications.error('Source Info', 'Change Control Error', `${e}`)
    }

    try {
      if (changes.ks.currentValue) {
        this.reset();

        this.ksMetadata = this.ks.reference.source.website?.metadata?.meta ?? [];

        let ks: KnowledgeSource = this.ks;
        this.populateCalendar(ks);

        if (!ks.importMethod) {
          ks.importMethod = 'manual';
        }

        if (ks.ingestType === 'website') {
          ks.accessLink = new URL(ks.accessLink);
          let urlParam = ks.accessLink.searchParams.get('v');

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

          const sanitized = this.sanitizer.sanitize(SecurityContext.URL, ks.accessLink)
          if (sanitized) {
            this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(sanitized);
          }
        }

        if (ks.ingestType === 'file') {
          this.fileConfig = {
            filePath: ks.reference.source.file?.path ?? ''
          }
          if (typeof ks.accessLink === 'string')
            this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl('file://' + encodeURI(ks.accessLink));

          this.ksIsPdf = this.ks.reference.source.file?.type.includes('pdf') ?? false;
        }

        this.form.patchValue({
          id: ks.id.value,
          title: ks.title,
          description: ks.description,
          topics: ks.topics
        })

        setTimeout(() => {
          this.allowCollapsedContent = true;
        }, 500);
      }
    } catch (e) {
      this.notifications.error('Source Info', 'Change Control Error', `${e}`)
    }
  }

  ngOnInit(): void {
  }

  populateCalendar(ks: KnowledgeSource) {
    this.events = [];

    // TODO: remove dateCreated, to be replaced by ks.events
    // this.events.push({
    //   status: 'Created',
    //   date: ks.dateCreated
    // });

    for (let mod of this.ks.dateModified) {
      this.events.push({
        status: 'Modified',
        date: mod
      });
    }

    for (let access of this.ks.dateAccessed) {
      this.events.push({
        status: 'Accessed',
        date: access
      });
    }

    if (!this.ks.events) {
      this.ks.events = [];
    }

    for (let event of this.ks.events) {
      this.events.push({
        status: event.label,
        date: event.date
      })
    }

    this.events.sort((a, b) => {
      a = new Date(a.date);
      b = new Date(b.date);
      if (a < b)
        return -1;
      if (a > b)
        return 1;
      return 0;
    });

    if (ks.dateDue) {
      ks.dateDue = new Date(ks.dateDue);
    } else {
      ks.dateDue = undefined;
    }
  }

  onTopicClick($event: any) {
    if (!$event.value) {
      return;
    }

    this.topics.search($event.value);
  }

  onKsOpen() {
    this.command.open(this.ks);
  }

  onKsPreview() {
    this.command.preview(this.ks);
  }

  onKsRemove() {
    if (this.ks.associatedProject && this.ks.associatedProject.value.length > 0) {
      this.command.remove([this.ks]);
    }
    this.onRemove.emit(this.ks);
    this.shouldClose.emit();
  }

  youtubeToggle($event: any) {
    if (!this.ksYoutubePlayer) {
      return;
    }
    try {
      if ($event.collapsed === true) {
        this.ksYoutubePlayer.pauseVideo();
      } else {
        this.ksYoutubePlayer.playVideo();
      }
    } catch (e) {

    }
  }

  onGoToProject(_: MouseEvent) {
    this.router.navigate(['app', 'projects', this.ks.associatedProject.value]);
    this.shouldClose.emit();
  }

  update() {
    if (this.ks.associatedProject && this.ks.associatedProject.value.length > 0) {
      this.command.update([this.ks], !this.isDialog);
      this.onSaved.emit(this.ks);
    }
  }

  onFlagged($event: any) {
    this.ks.flagged = $event.checked ?? false
    this.update();
  }

  onDueDate($event: any) {
    this.ks.dateDue = $event;
    this.update();
  }

  onMove() {
    this.command.move([this.ks]);
  }

  show(accessLink: URL | string) {
    if (typeof accessLink === 'string') {
      this.ipc.showItemInFolder(accessLink);
      this.notifications.debug('Source Info', 'Locating Folder', location, 'toast');
    }
  }

  onPdfToggle(_: any) {
    // TODO: Persist state in local storage
  }

  toClipboard(key: string) {
    if (key && key.trim().length > 0) {
      this.clipboard.copy(key);
      this.notifications.success('Source Info', 'Copied!', key);
    }
  }
}
