/**
 Copyright 2021 Rob Royce

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

import {Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild} from '@angular/core';
import {KnowledgeSource} from "src/app/models/knowledge.source.model";
import {DomSanitizer, SafeUrl} from "@angular/platform-browser";
import {KcFileViewConfig} from "../ks-viewport-components/file-viewport/file-view.component";
import {BrowserViewDialogService} from "../../../services/ipc-services/browser-service/browser-view-dialog.service";
import {KsFactoryService} from "../../../services/factory-services/ks-factory-service/ks-factory.service";
import {WebsiteMetaTagsModel} from "../../../models/website.model";

let apiLoaded = false;

@Component({
  selector: 'app-ks-info',
  templateUrl: './ks-info.component.html',
  styleUrls: ['./ks-info.component.scss']
})
export class KsInfoComponent implements OnInit, OnChanges {
  @Input() ks!: KnowledgeSource;

  @Input() height?: number;

  @Input() width?: number;

  @Input() maximized?: boolean;

  @Output() shouldClose = new EventEmitter<boolean>();

  @ViewChild('ksNotes') ksNotes!: ElementRef;

  events: any[] = [];
  ksIsYoutubeVideo: boolean = false;
  ksYouTubeSafeUrl?: SafeUrl;
  ksYoutubeVideoId: string = '';
  fileConfig?: KcFileViewConfig;
  ksYoutubeHidden: boolean = false;
  safeUrl?: SafeUrl;
  ksYoutubeWidth: number = 640;
  ksYoutubeHeight: number = 480;
  ksMetadata: WebsiteMetaTagsModel[] = [];

  constructor(private sanitizer: DomSanitizer,
              private browserService: BrowserViewDialogService,
              private ksFactory: KsFactoryService) {
  }

  get ksIsWebsite() {
    return this.ks.ingestType === 'website';
  };

  get ksHasPreview() {
    return this.ksIsPdf || this.ksIsYoutubeVideo;
  };

  get ksPreviewHeader() {
    if (this.ksIsPdf)
      return 'PDF';
    if (this.ksIsYoutubeVideo)
      return 'YouTube';
    if (this.ksIsWebsite)
      return 'Website'
    else
      return '';
  }

  get ksIsPdf() {
    return this.ks.ingestType === 'file' && this.ks.reference.source.file?.type.includes('pdf');
  };

  get ksAssociatedProjectId() {
    return this.ks.associatedProject?.value ?? '';
  }

  ngOnInit(): void {
    this.ksMetadata = this.ks.reference.source.website?.metadata?.meta ?? [];
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.ks && changes.ks.currentValue) {
      let ks: KnowledgeSource = changes.ks.currentValue;
      if (ks) {
        this.events.push({
          status: 'Created',
          date: ks.dateCreated
        });

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

        if (ks.ingestType === 'website') {
          ks.accessLink = new URL(ks.accessLink);
          let urlParam = ks.accessLink.searchParams.get('v');
          if (ks.accessLink.hostname === 'www.youtube.com' && urlParam) {
            this.ksIsYoutubeVideo = true;
            this.ksYoutubeVideoId = urlParam;
            if (!apiLoaded) {
              // This code loads the IFrame Player API code asynchronously, according to the instructions at
              // https://developers.google.com/youtube/iframe_api_reference#Getting_Started
              const tag = document.createElement('script');
              tag.src = 'https://www.youtube.com/iframe_api';
              document.body.appendChild(tag);
              apiLoaded = true;
            }
          }
        }

        if (ks.ingestType === 'file') {
          this.fileConfig = {
            filePath: ks.reference.source.file?.path ?? ''
          }
          if (typeof ks.accessLink === 'string')
            this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl('file://' + encodeURI(ks.accessLink));
        }
      }
    }
  }

  ksYoutubeStateChange($event: any) {
    console.log('Got state change from Youtube player: ', $event);
  }

  onTopicClick($event: any) {
    if (!$event.value) {
      return;
    }

    const ks = this.ksFactory.searchKS($event.value);
    this.browserService.open({ks: ks});
  }

  onPdfClick($event: MouseEvent) {
    console.warn('Pdf click event unhandled: ', $event);
  }
}
