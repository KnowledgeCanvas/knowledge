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

import {Component, OnDestroy, OnInit} from '@angular/core';
import {KnowledgeSource} from "../../../models/knowledge.source.model";
import {ElectronIpcService} from "../../../services/ipc-services/electron-ipc/electron-ipc.service";
import {Clipboard} from "@angular/cdk/clipboard";
import {ExtractionService} from "../../../services/ingest-services/web-extraction-service/extraction.service";
import {KcFileViewClickEvent, KcFileViewConfig} from "../ks-viewport-components/file-viewport/file-view.component";
import {KcBrowserViewClickEvent, KcBrowserViewConfig, KcBrowserViewNavEvent} from "../ks-viewport-components/browser-viewport/browser-view.component";
import {KsFactoryService} from "../../../services/factory-services/ks-factory-service/ks-factory.service";
import {KsQueueService} from "../../../services/command-services/ks-queue-service/ks-queue.service";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {NotificationsService} from "../../../services/user-services/notification-service/notifications.service";
import {KsCommandService} from "../../../services/command-services/ks-command/ks-command.service";

export interface KsPreviewInput {
  ks: KnowledgeSource
}

@Component({
  selector: 'app-ks-preview',
  templateUrl: './ks-preview.component.html',
  styleUrls: ['./ks-preview.component.scss']
})
export class KsPreviewComponent implements OnInit, OnDestroy {
  // Must be configured to display file view. Should be undefined when displaying browser view
  fileViewConfig: KcFileViewConfig | undefined = undefined;

  // Must be configured to display browser view. Should be undefined when displaying file view
  browserViewConfig: KcBrowserViewConfig | undefined = undefined;

  // Can be set to any color, rgb, rgba, or hex
  backgroundColor: string = 'white'

  // The KS for which this preview is being opened
  ks: KnowledgeSource;

  // Set to true if something changes that requires the KS to be updated after dialog close
  ksChanged: boolean = false;

  // An array of file types that have been tested and are to be supported in file viewer
  supportedFileTypes: string[] = ['pdf', 'jpeg', 'png'];

  // Set to true once file or browser viewers have loaded properly
  viewReady: boolean = false;

  // Should be set to file path (if file) or current browser view URL (if website)
  private activeBrowserViewUrl: string = '';

  constructor(private extractionService: ExtractionService,
              private ref: DynamicDialogRef,
              private config: DynamicDialogConfig,
              private ipcService: ElectronIpcService,
              private ksFactory: KsFactoryService,
              private ksCommandService: KsCommandService,
              private ksQueue: KsQueueService,
              private clipboard: Clipboard,
              private notificationsService: NotificationsService) {
    this.ks = config.data.ks;
  }

  ngOnInit(): void {
    switch (this.ks.reference.ingestType) {
      case "file":
        this.previewFile();
        break;
      default:
        this.previewWebsite();
    }
    this.ks.dateAccessed.push(new Date());
    this.ksChanged = true;
  }

  ngOnDestroy() {
    this.close();
  }

  close() {
    this.ipcService.closeBrowserView();
    this.ref.close();
  }

  copy(text: string) {
    this.clipboard.copy(text);

    this.notificationsService.toast({
      summary: 'Copied!',
      severity: 'success',
      life: 3000
    });
  }

  onFileViewClickEvent(clickEvent: KcFileViewClickEvent) {
    if (!this.fileViewConfig) {
      console.error('Wires are crossed somewhere. Received KcFileViewClickEvent but FileViewConfig not present...');
      return;
    }

    if (clickEvent.copyClicked) {
      this.copy(this.fileViewConfig.filePath);
    }
    if (clickEvent.closeClicked) {
      this.close();
    }

    if (clickEvent.openClicked) {
      this.ipcService.openLocalFile(this.fileViewConfig.filePath);
    }
  }

  onBrowserViewClickEvent(clickEvent: KcBrowserViewClickEvent) {
    if (!this.browserViewConfig) {
      console.error('Wires are crossed somewhere. Received KcFileViewClickEvent but FileViewConfig not present...');
      return;
    }

    if (clickEvent.copyClicked) {
      this.copy(this.activeBrowserViewUrl);
    }

    if (clickEvent.closeClicked) {
      this.close();
    }

    if (clickEvent.saveClicked) {
      this.save();
    }

    if (clickEvent.openClicked) {
      window.open(this.activeBrowserViewUrl);
    }
  }

  onBrowserViewNavEvent(navEvent: KcBrowserViewNavEvent) {
    this.activeBrowserViewUrl = navEvent.url?.href || '';

    if (!this.browserViewConfig)
      return;

    // TODO: there should be a more robust check to make sure the KS is not already in the system...
    if (navEvent.url?.href !== this.browserViewConfig.url.href) {
      this.browserViewConfig = {...this.browserViewConfig, ...{canSave: true}};
    } else {
      this.browserViewConfig = {...this.browserViewConfig, ...{canSave: undefined}};
    }
  }

  previewFile() {
    // Make sure browserViewConfig is undefined
    this.browserViewConfig = undefined;

    if (!this.ks.reference.source.file || typeof this.ks.accessLink !== 'string')
      return;

    console.log('Checking file type of: ', this.ks);

    let fileType = this.ks.reference.source.file.type;

    // TODO: there's definitely be a better way to handle this... (double check with OS and/or just open in appropriate app)
    if (fileType === '') {
      console.error('File type not recognized: ', fileType);
      this.ref.close();
    }

    console.log('File type is: ', fileType);

    // console.log('Image: ', fileType.indexOf('image'));
    // console.log('PDF: ', fileType.indexOf('pdf'));
    // console.log('Video: ', fileType.indexOf('video'));
    // console.log('Audio: ', fileType.indexOf('audio'));
    // console.log('Office.x: ', fileType.indexOf('officedocument'));
    // console.log('Old Word: ', fileType.indexOf('msword'));
    // console.log('Old ppt: ', fileType.indexOf('powerpoint'));


    let supported: boolean = false;
    for (let supportedType of this.supportedFileTypes) {
      if (fileType.indexOf(supportedType) > 0) {
        supported = true;
        console.log('File type is supported...');
        this.previewSupportedType(supportedType);
      }
    }

    if (!supported) {
      console.warn('This file type is not supported!');

      this.notificationsService.toast({
        severity: 'warn',
        summary: 'Oops!',
        detail: `Knowledge Canvas does not support previewing files of type: ${fileType}`,
        life: 5000
      });
    }
  }

  previewSupportedType(type: string) {
    console.log('Switching on preview type: ', type);
    switch (type) {
      case 'pdf':
        this.previewPdf();
        break;
      case 'png':
        this.previewImage();
        break;
    }
  }

  previewPdf() {
    if (typeof this.ks.accessLink !== 'string') {
      console.warn('PDF cannot be opened because invalid access link...');
      return;
    }

    this.fileViewConfig = {
      filePath: this.ks.accessLink,
      isDialog: true
    }

    console.log('FileViewConfig: ', this.fileViewConfig);
    this.viewReady = true;
  }

  previewImage() {
    if (typeof this.ks.accessLink !== 'string') {
      console.warn('PDF cannot be opened because invalid access link...');
      return;
    }

    this.fileViewConfig = {
      filePath: this.ks.accessLink,
      isDialog: true
    }

    this.viewReady = true;
  }

  previewWebsite() {
    this.fileViewConfig = undefined;
    let webUrl: URL;

    if (typeof this.ks.accessLink === 'string') {
      webUrl = new URL(this.ks.accessLink);
    } else {
      webUrl = this.ks.accessLink;
    }

    this.browserViewConfig = {
      url: webUrl,
      isDialog: true
    }
  }


  save() {
    this.ksFactory.make('website', this.activeBrowserViewUrl).then((ks) => {
      if (!ks) {
        console.warn('Undefined Knowledge Source on apparent success...');
        return;
      }
      this.ksQueue.enqueue([ks]);
    }).catch((reason) => {
      this.notificationsService.toast({
        severity: 'error',
        summary: 'Preview',
        detail: `Unable to save page.\n\n${reason.toString()}`
      });
    });
  }

  setViewReady(viewReady: boolean) {
    this.viewReady = viewReady;
  }

  onError(error: string) {
    this.notificationsService.toast({
      severity: 'error',
      summary: 'Preview',
      detail: error
    });
    this.ksCommandService.open(this.ks);
    this.ref.close();
  }
}
