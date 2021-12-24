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

import {Component, EventEmitter, Inject, OnDestroy, OnInit, Output} from '@angular/core';
import {KnowledgeSource} from "../../../../../ks-lib/src/lib/models/knowledge.source.model";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {ElectronIpcService} from "../../../../../ks-lib/src/lib/services/electron-ipc/electron-ipc.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Clipboard} from "@angular/cdk/clipboard";
import {ExtractionService} from "../../../../../ks-lib/src/lib/services/extraction/extraction.service";
import {KcFileViewClickEvent, KcFileViewConfig} from "../../../../../ks-lib/src/lib/components/viewports/file-view/file-view.component";
import {KcBrowserViewClickEvent, KcBrowserViewConfig, KcBrowserViewNavEvent} from "../../../../../ks-lib/src/lib/components/viewports/browser-view/browser-view.component";
import {KsFactoryService} from "../../../../../ks-lib/src/lib/services/ks-factory/ks-factory.service";
import {KsQueueService} from "../ks-queue-service/ks-queue.service";

export interface KsPreviewInput {
  ks: KnowledgeSource
}

export interface KsPreviewOutput {
  ks: KnowledgeSource,
  ksChanged: boolean
}

@Component({
  selector: 'app-ks-preview',
  templateUrl: './ks-preview.component.html',
  styleUrls: ['./ks-preview.component.scss']
})
export class KsPreviewComponent implements OnInit, OnDestroy {
  /** Used to emit output before this dialog is closed */
  @Output() output = new EventEmitter<KsPreviewOutput>();

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
  supportedFileTypes: string[] = ['pdf']

  // Set to true once file or browser viewers have loaded properly
  viewReady: boolean = false;

  // Should be set to file path (if file) or current browser view URL (if website)
  private activeBrowserViewUrl: string = '';

  constructor(public dialogRef: MatDialogRef<KsPreviewComponent>,
              @Inject(MAT_DIALOG_DATA) public input: KsPreviewInput,
              private extractionService: ExtractionService,
              private ipcService: ElectronIpcService,
              private ksFactory: KsFactoryService,
              private ksQueue: KsQueueService,
              private snackbar: MatSnackBar,
              private clipboard: Clipboard) {

    /**
     * This intercepts all calls to close the current dialog. Therefore, methods
     * that want to do something after the dialog has been closed must do so by
     * setting class parameters, which will be included in the output
     */

    this.dialogRef.beforeClosed().subscribe(() => {
      /**
       * TODO: this currently doesn't do anything because there are no changes in the preview dialog
       * However, there will eventually be changes such as highlighting a document or text in a web page...
       */
      let dialogOutput: KsPreviewOutput = {ks: this.ks, ksChanged: this.ksChanged};
      this.output.emit(dialogOutput);
    });

    this.ks = input.ks;
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
    this.dialogRef.close();
  }

  copy(text: string) {
    this.snackbar.open('Copied!', 'Dismiss', {
      duration: 3000,
      verticalPosition: 'top'
    });

    this.clipboard.copy(text);
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


    let fileType = this.ks.reference.source.file.type;

    // TODO: there's definitely be a better way to handle this... (double check with OS and/or just open in appropriate app)
    if (fileType === '') {
      console.error('File type not recognized: ', fileType);
      this.dialogRef.close();
    }

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
        this.previewSupportedType(supportedType);
      }
    }

    if (!supported) {
      console.warn('This file type is not supported!');

      this.snackbar.open('Sorry, but that file type is not supported yet. Try opening with the default application instead!', 'Dismiss', {
        panelClass: 'kc-danger-zone-snackbar',
        duration: 3000
      });

      // Wait before closing. If not, the error "NG0100: ExpressionChangedAfterItHasBeenCheckedError" appears
      setTimeout(() => {
        this.close();
      });
    }
  }

  previewSupportedType(type: string) {
    switch (type) {
      case 'pdf':
        this.previewPdf();
        this.ks.dateAccessed = new Date();
        this.ksChanged = true;
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

  // TODO: I didn't want to throw this code away, but so far I have not re-implemented thumbnail views for non-PDF... there's also a big issue on Windows (works on Mac though :P )
  // getBrowserViewDimensions(elementName: string): any {
  //   let element = document.getElementById(elementName);
  //   if (element) {
  //     return element.getBoundingClientRect();
  //   }
  // }
  //
  // emplaceFileThumbnail() {
  //   if (typeof this.ks.accessLink !== 'string') {
  //     console.warn('Could not generate thumbnail due to invalid access link.');
  //     return;
  //   }
  //
  //   let position = this.getBrowserViewDimensions('electron-browser-view');
  //
  //   let thumbnailRequest: KsThumbnailRequest = {
  //     path: this.ks.accessLink,
  //     width: Math.floor(position.width),
  //     height: Math.floor(position.height)
  //   };
  //
  //   this.ipcService.getFileThumbnail([thumbnailRequest]).then((thumbnail) => {
  //     this.thumbnail = thumbnail[0];
  //     this.viewReady = true;
  //   }).catch((error) => {
  //     console.error(error);
  //     this.snackBar.open(`Error: Preview not available -- ${error.message}`, 'Dismiss', {
  //       verticalPosition: 'bottom',
  //       panelClass: 'kc-danger-zone-snackbar',
  //       duration: 3000
  //     });
  //     this.selectedTab.setValue(0);
  //   });
  // }

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

      this.snackbar.open('Adding to "Up Next"!', 'Dismiss', {
        duration: 3000,
        verticalPosition: 'top'
      });

      this.ksQueue.enqueue([ks]);
    }).catch((reason) => {
      this.snackbar.open(`Unable to save because: ${reason}`, 'Dismiss', {
        verticalPosition: 'top',
        panelClass: ['kc-danger-zone-snackbar']
      });
    });
  }

  setViewReady(viewReady: boolean) {
    this.viewReady = viewReady;
  }
}
