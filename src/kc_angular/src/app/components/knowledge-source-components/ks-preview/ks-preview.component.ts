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
import {Component, OnDestroy, OnInit} from '@angular/core';
import {KnowledgeSource} from "../../../models/knowledge.source.model";
import {ElectronIpcService} from "../../../services/ipc-services/electron-ipc/electron-ipc.service";
import {Clipboard} from "@angular/cdk/clipboard";
import {ExtractorService} from "../../../services/ingest-services/extractor-service/extractor.service";
import {BrowserViewClickEvent, BrowserViewConfig, BrowserViewNavEvent, FileViewClickEvent, FileViewConfig} from "../../../../../../kc_shared/models/browser.view.model";
import {KsFactoryService} from "../../../services/factory-services/ks-factory-service/ks-factory.service";
import {IngestService} from "../../../services/ingest-services/ingest-service/ingest.service";
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
  fileViewConfig: FileViewConfig | undefined = undefined;

  // Must be configured to display browser view. Should be undefined when displaying file view
  browserViewConfig: BrowserViewConfig | undefined = undefined;

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

  constructor(private extractor: ExtractorService,
              private ref: DynamicDialogRef,
              private config: DynamicDialogConfig,
              private ipc: ElectronIpcService,
              private factory: KsFactoryService,
              private command: KsCommandService,
              private ingest: IngestService,
              private clipboard: Clipboard,
              private notifications: NotificationsService) {
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
    this.ipc.closeBrowserView();
    this.ref.close(this.ks);
  }

  copy(text: string) {
    this.clipboard.copy(text);
    this.notifications.success('KsPreview', 'Copied to Clipboard!', '📋')
  }

  onFileViewClickEvent(clickEvent: FileViewClickEvent) {
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
      this.ipc.openLocalFile(this.fileViewConfig.filePath);
    }
  }

  onBrowserViewClickEvent(clickEvent: BrowserViewClickEvent) {
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

  onBrowserViewNavEvent(navEvent: BrowserViewNavEvent) {
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

    let fileType = this.ks.reference.source.file.type;

    // TODO: there's definitely be a better way to handle this... (double check with OS and/or just open in appropriate app)
    if (fileType === '') {
      console.error('File type not recognized: ', fileType);
      this.ref.close();
    }

    let supported: boolean = false;
    for (let supportedType of this.supportedFileTypes) {
      if (fileType.indexOf(supportedType) > 0) {
        supported = true;
        console.debug('KsPreview.previewFile() | supported fileType === ', fileType);
        this.previewSupportedType(supportedType);
      }
    }

    if (!supported) {
      console.warn('This file type is not supported!');
      this.notifications.warn('KsPreview', 'Unsupported File Type', 'Knowledge Canvas does not currently support previewing files of that type.');
      this.ref.close();
    }
  }

  previewSupportedType(type: string) {
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
    this.factory.make('website', this.activeBrowserViewUrl).then((ks) => {
      if (!ks) {
        console.warn('Undefined Knowledge Source on apparent success...');
        return;
      }
      this.ingest.enqueue([ks]);
    }).catch((reason) => {
      this.notifications.error('KsPreview', 'Invalid Import', reason);
    });
  }

  setViewReady(viewReady: boolean) {
    this.viewReady = viewReady;
  }

  onError(error: string) {
    this.notifications.error('KsPreview', 'File Preview Error', error);
    this.command.open(this.ks);
    this.ref.close();
  }
}
