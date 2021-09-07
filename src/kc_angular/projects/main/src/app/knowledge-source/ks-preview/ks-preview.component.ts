import {Component, Inject, OnInit} from '@angular/core';
import {KnowledgeSource} from "../../../../../ks-lib/src/lib/models/knowledge.source.model";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {ElectronIpcService, ElectronNavEvent} from "../../../../../ks-lib/src/lib/services/electron-ipc/electron-ipc.service";
import {IpcResponse} from "kc_electron/src/app/models/electron.ipc.model";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Clipboard} from "@angular/cdk/clipboard";
import {ExtractionService} from "../../../../../ks-lib/src/lib/services/extraction/extraction.service";

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
export class KsPreviewComponent implements OnInit {
  ks: KnowledgeSource;
  supportedFileTypes: string[] = [
    'pdf'
  ]
  url: URL | undefined;
  path: string | undefined;
  forwardDisabled: boolean = true;
  loading: boolean = true;
  ksChanged: boolean = false;
  viewReady: boolean = false;
  saveDisabled: boolean = true;
  backgroundColor: string = 'red'
  canGoBack: boolean = false;
  canGoForward: boolean = false;
  displayUrl: string = '';

  constructor(public dialogRef: MatDialogRef<KsPreviewComponent>,
              @Inject(MAT_DIALOG_DATA) public input: KsPreviewInput,
              private ipcService: ElectronIpcService,
              private extractionService: ExtractionService,
              private snackbar: MatSnackBar,
              private clipboard: Clipboard) {

    /**
     * This intercepts all calls to close the current dialog. Therefore, methods
     * that want to do something after the dialog has been closed must do so by
     * setting class parameters, which will be included in the output
     */
    this.dialogRef.beforeClosed().subscribe(() => {
      this.ipcService.closeBrowserView();
      let dialogOutput: KsPreviewOutput = {ks: this.ks, ksChanged: this.ksChanged};
      this.dialogRef.close(dialogOutput);
    });

    this.ks = input.ks;

    // TODO: REMOVE
    console.log('Previewing ks: ', this.ks);
  }

  ngOnInit(): void {
    switch (this.ks.reference.ingestType) {
      case "file":
        this.previewFile();
        break;
      default:
        this.previewWebsite();
    }
  }

  previewFile() {
    if (!this.ks.reference.source.file || typeof this.ks.accessLink !== 'string')
      return;

    this.url = undefined;

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

    for (let supportedType of this.supportedFileTypes) {
      if (fileType.indexOf(supportedType) > 0) {
        this.previewSupportedType(supportedType);
      }
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
    // TODO: REMOVE
    console.log('Preview PDF called...');

    if (typeof this.ks.accessLink !== 'string') {
      console.warn('PDF cannot be opened because invalid access link...');
      return;
    }

    this.path = this.ks.accessLink;
    this.viewReady = true;
  }

  previewWebsite() {
    console.log('Previewing website: ', this.ks.accessLink);
    if (typeof this.ks.accessLink === 'string') {
      this.url = new URL(this.ks.accessLink);
    } else {
      this.url = this.ks.accessLink;
    }
  }

  refresh() {
    console.log('Refresh');
    this.ipcService.browserRefresh();
  }

  // forward() {
  //   console.log('Forward');
  //   this.navIndex = this.navIndex + 1;
  //   this.displayUrl = this.navStack[this.navIndex];
  //   this.ipcService.browserViewGoForward();
  // }

  back() {
    if (this.canGoBack) {
      this.ipcService.browserViewGoBack();
      this.getBrowserViewState();
    }
  }

  forward() {
    if (this.canGoForward) {
      this.ipcService.browserViewGoForward();
      this.getBrowserViewState();
    }
  }

  save() {
    console.log('Saving url: ', this.displayUrl);
    // TODO: there should be a service that creates KS automatically from link...
  }

  setViewReady(viewReady: any) {
    console.log('View ready: ', viewReady);
    this.viewReady = viewReady;
  }

  onIpcResponse(response: IpcResponse) {
    if (response.error) {
      // TODO: show a more meaningful error and possibly try to resolve...
      console.error(response.error);
      this.dialogRef.close();
    } else if (response.success) {
      console.log('IPC Success: ', response.success);
    }
  }

  getBrowserViewState() {
    let p = [this.ipcService.browserViewCanGoBack(), this.ipcService.browserViewCanGoForward(),]
    Promise.all(p).then((results) => {
      this.canGoBack = results[0];
      this.canGoForward = results[1];
    });

    this.ipcService.browserViewCurrentUrl().then((value) => {
      console.log('Got current url: ', value);
      this.displayUrl = value;

      if (typeof this.ks.accessLink === 'string') {
        this.saveDisabled = this.ks.accessLink === value;
      } else {
        this.saveDisabled = this.ks.accessLink.href === value;
      }
    });
  }

  onBrowserViewNavEvent(electronNavEvent: string) {
    this.getBrowserViewState();
  }

  copy() {
    this.snackbar.open('Copied link!', 'Dismiss', {
      duration: 3000
    });
    this.getBrowserViewState();
    setTimeout(() => {
      if (this.path) {
        this.clipboard.copy(this.path);
      } else {
        this.clipboard.copy(this.displayUrl);
      }
    }, 1000);
  }
}
