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
import {KnowledgeSource} from "src/app/models/knowledge.source.model";
import {DomSanitizer, SafeUrl} from "@angular/platform-browser";
import {FileViewConfig} from "../../../../../kc_shared/models/browser.view.model";
import {BrowserViewDialogService} from "../../services/ipc-services/browser-view-dialog.service";
import {KsFactoryService} from "../../services/factory-services/ks-factory.service";
import {WebsiteMetaTagsModel} from "../../../../../kc_shared/models/web.source.model";
import {KsCommandService} from "../../services/command-services/ks-command.service";
import {YouTubePlayer} from "@angular/youtube-player";
import {Router} from "@angular/router";


@Component({
  selector: 'app-ks-info',
  template: `
    <p-scrollPanel class="w-full h-full">
      <div class="p-fluid grid pb-4">
        <p-panel header="Details" class="col-12">
          <div class="w-full h-full grid">
            <div class="col-12 lg:col-6">
              <div class="flex flex-row flex-auto w-full">
                <app-ks-thumbnail [ks]="ks" class="col-12 border-1 border-dashed border-100 border-round"></app-ks-thumbnail>
              </div>
              <div class="flex flex-row flex-auto w-full">
                <app-action-bar class="w-full p-fluid"
                                [showEdit]="false"
                                [showFlag]="true"
                                [flagged]="ks.flagged"
                                (onFlagged)="ks.flagged = $event.checked ?? false"
                                (onOpen)="onKsOpen()"
                                (onPreview)="onKsPreview()"
                                (onRemove)="onKsRemove()">
                </app-action-bar>
              </div>
            </div>

            <div class="col-12 lg:col-6">
              <div class="flex-row-center-between col-12">
                <div class="field p-fluid w-full">
                  <input id="_ksTitle"
                         type="text"
                         class="text-2xl"
                         pInputText
                         required
                         [(ngModel)]="ks.title">
                </div>
              </div>
              <div class="field col-12">
            <textarea pInputTextarea id="_ksDescription"
                      [rows]="5"
                      [autoResize]="true"
                      class="p-fluid"
                      style="max-height: 12rem"
                      placeholder="Description"
                      [(ngModel)]="ks.description">
              </textarea>
              </div>
              <div class="field col-12">
                <p-chips [(ngModel)]="ks.topics"
                         [max]="5"
                         [allowDuplicate]="false"
                         [addOnBlur]="true"
                         [addOnTab]="true"
                         (onChipClick)="onTopicClick($event)"
                         placeholder="Start typing to add a topic...">
                </p-chips>
              </div>
            </div>
          </div>
        </p-panel>

        <p-panel header="Project"
                 *ngIf="ks.associatedProject && ks.associatedProject.value.length"
                 class="col-12"
                 [toggleable]="true"
                 [collapsed]="collapseProject">
          <!--          TODO: finish this...-->
          <div class="h-full w-full">
            <div class="w-full flex flex-row flex-auto">
              <div class="p-fluid grid w-full">
                <div class="field p-float-label col-6 mt-5 flex-row-center-between">
                  <button pButton class="p-button-text" icon="pi pi-arrow-circle-right" (click)="onGoToProject($event)"></button>
                  <input id="projectName" type="text" pInputText disabled
                         [ngModel]="ks.associatedProject.value | projectName">
                  <label for="projectName">Project Name</label>
                </div>
                <div class="field p-float-label col-6 mt-5">
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
                 [collapsed]="collapseTimeline">
          <div class="flex flex-column flex-auto">
            <div class="calendar-actions-container col-4">
              <div class="p-inputgroup">
                <button pButton icon="pi pi-calendar-plus" (click)="dueDateCal.toggle()"
                        pTooltip="Select a date and time when {{ks.title}} is due.">
                </button>
                <p-calendar [(ngModel)]="ks.dateDue"
                            #dueDateCal
                            appendTo="body"
                            placeholder="Due Date"
                            [showOtherMonths]="true"
                            [numberOfMonths]="1"
                            [monthNavigator]="true"
                            [showIcon]="false"
                            [showTime]="true"
                            [showButtonBar]="true"
                            [hideOnDateTimeSelect]="false"
                            hourFormat="12">
                </p-calendar>
                <button pButton icon="pi pi-times" [disabled]="!ks.dateDue" (click)="ks.dateDue = undefined"></button>
              </div>
            </div>

            <app-timeline [events]="events" class="w-full h-full"></app-timeline>
          </div>
        </p-panel>

        <!--    TODO: this is causing the app to crash randomly... might have something to do with filenames but not sure...-->
        <p-panel *ngIf="this.ksIsPdf"
                 class="col-12"
                 #pdfPanel
                 header="PDF"
                 [collapsed]="collapsePdf"
                 [toggleable]="true">
          <ng-template pTemplate="icons">
            <button pButton class="p-panel-header-icon" icon="pi pi-external-link" (click)="onKsOpen()"></button>
          </ng-template>

          <ng-template pTemplate="content">
            <div *ngIf="this.ksIsPdf" class="flex-col-center-start h-full">
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
                 (onAfterToggle)="youtubeToggle($event)">
          <ng-template pTemplate="icons">
            <button pButton
                    class="p-panel-header-icon"
                    icon="pi pi-external-link"
                    (click)="onKsOpen()">
            </button>
          </ng-template>
          <ng-template pTemplate="content">
            <div class="p-fluid w-full flex-row-center-center">
              <youtube-player *ngIf="this.ksIsYoutubeVideo && this.allowCollapsedContent"
                              [videoId]="ksYoutubeVideoId"
                              #youtubePlayer>
              </youtube-player>
            </div>
          </ng-template>
        </p-panel>

        <p-panel header="Metadata" class="col-12"
                 *ngIf="ksMetadata.length > 0"
                 [toggleable]="true"
                 [collapsed]="collapseExtraction">
          <textarea pInputTextarea id="_ksRawText"
                    [autoResize]="true"
                    class="p-fluid w-full"
                    [rows]="10"
                    placeholder="Extracted Text"
                    [(ngModel)]="ks.rawText">
          </textarea>
          <p-table *ngIf="this.allowCollapsedContent"
                   [value]="ksMetadata"
                   [autoLayout]="false"
                   [paginator]="true"
                   [responsive]="false"
                   [rows]="10">
            <ng-template pTemplate="header">
              <tr>
                <th pSortableColumn="key">Key
                  <p-sortIcon field="key"></p-sortIcon>
                </th>
                <th pSortableColumn="value">Value
                  <p-sortIcon field="value"></p-sortIcon>
                </th>
                <th pSortableColumn="property">Property
                  <p-sortIcon field="property"></p-sortIcon>
                </th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-meta>
              <tr *ngIf="meta.key.length > 0 && meta.value.length > 0">
                <td>{{meta.key}}</td>
                <td>{{meta.value}}</td>
                <td>{{meta.property}}</td>
              </tr>
            </ng-template>
          </p-table>
        </p-panel>

        <p-panel header="Source Model"
                 class="col-12"
                 [toggleable]="true"
                 [collapsed]="collapseSource">
          <ng-template pTemplate="content">
            <div class="p-fluid grid" *ngIf="this.allowCollapsedContent">
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
                <input id="importMethod" type="text" pInputText disabled [value]="ks.importMethod | titlecase">
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

              <div class="field p-float-label sm:col-12 md:col-12 lg:col-6 mt-4">
                <input id="accessLink" type="text" pInputText disabled [value]="ks.accessLink">
                <label for="accessLink">Access Link</label>
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
    `
  ]
})
export class KsInfoComponent implements OnInit, OnChanges {
  @Input() ks!: KnowledgeSource;

  @Input() collapseAll: boolean = false;

  @Output() onEdit = new EventEmitter<KnowledgeSource>();

  @Output() onRemove = new EventEmitter<KnowledgeSource>();

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

  collapseTimeline: boolean = false;

  collapseYouTube: boolean = true;

  collapsePdf: boolean = true;

  collapseExtraction: boolean = true;

  collapseSource: boolean = true;

  collapseProject: boolean = false;

  constructor(private sanitizer: DomSanitizer,
              private browser: BrowserViewDialogService,
              private router: Router,
              private command: KsCommandService,
              private factory: KsFactoryService) {
  }

  get ksIsPdf() {
    return this.ks.ingestType === 'file' && this.ks.reference.source.file?.type.includes('pdf');
  };

  get ksAssociatedProjectId() {
    return this.ks.associatedProject?.value ?? '';
  }

  reset() {
    this.ksIsYoutubeVideo = false;
    this.ksYoutubeVideoId = '';
    this.safeUrl = undefined;
    this.fileConfig = undefined;

    this.collapseTimeline = false;
    this.collapseYouTube = true;
    this.collapsePdf = true;
    this.collapseExtraction = true;
    this.collapseSource = true;
    this.collapseProject = false;
  }

  onExpandAll() {
    this.collapseAll = false;
    this.collapsePdf = false;
    this.collapseTimeline = false;
    this.collapseYouTube = false;
    this.collapseSource = false;
    this.collapseExtraction = false;
    this.collapseProject = false;
  }

  onCollapseAll() {
    this.collapseAll = true;
    this.collapsePdf = true;
    this.collapseTimeline = true;
    this.collapseYouTube = true;
    this.collapseSource = true;
    this.collapseExtraction = true;
    this.collapseProject = true;
  }

  ngOnChanges(changes: SimpleChanges) {
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
        }

        setTimeout(() => {
          this.allowCollapsedContent = true;
        }, 500);
      }
    } catch (e) {

    }

    try {
      if (changes.collapseAll?.isFirstChange()) {
        return;
      }
      if (changes.collapseAll?.currentValue !== undefined) {
        if (changes.collapseAll.currentValue === true) {
          this.onCollapseAll();
        } else if (changes.collapseAll.currentValue === false) {
          this.onExpandAll();
        }
      }
    } catch (e) {

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

    const ks = this.factory.searchKS($event.value);
    this.browser.open({ks: ks});
  }

  onKsOpen() {
    this.command.open(this.ks);
  }

  onKsPreview() {
    this.command.preview(this.ks);
  }

  onKsEdit() {
    this.onEdit.emit(this.ks);
  }

  onKsRemove() {
    this.onRemove.emit(this.ks);
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

  onGoToProject($event: MouseEvent) {
    this.router.navigate(['app', 'projects', this.ks.associatedProject.value]);
    this.shouldClose.emit();
  }
}
