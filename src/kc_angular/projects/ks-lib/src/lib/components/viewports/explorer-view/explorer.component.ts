import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {ElectronIpcService} from "../../../services/electron-ipc/electron-ipc.service";
import {ExtractionService} from "../../../services/extraction/extraction.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Clipboard} from "@angular/cdk/clipboard";
import {IpcResponse} from "kc_electron/src/app/models/electron.ipc.model";
import {KnowledgeSource} from "../../../models/knowledge.source.model";

export interface KsExplorerInput {
  type: 'remote' | 'local',
  url?: URL,
  path?: string,
  displayUrl?: string,
  backgroundColor?: string
}

export interface KsExplorerOutput {

}

@Component({
  selector: 'ks-lib-explorer',
  templateUrl: './explorer.component.html',
  styleUrls: ['./explorer.component.scss']
})
export class ExplorerComponent implements OnInit, OnDestroy {
  @Input() input!: KsExplorerInput;
  backgroundColor: string = 'white'
  canGoBack: boolean = false;
  canGoForward: boolean = false;
  displayUrl: string = '';
  forwardDisabled: boolean = true;
  ks: KnowledgeSource | undefined;
  ksChanged: boolean = false;
  loading: boolean = true;
  path: string | undefined;
  saveDisabled: boolean = true;
  url: URL | undefined;
  viewReady: boolean = false;

  constructor(private ipcService: ElectronIpcService,
              private extractionService: ExtractionService,
              private snackbar: MatSnackBar,
              private clipboard: Clipboard) {
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.ipcService.closeBrowserView();
  }

  back() {
    if (this.canGoBack) {
      this.ipcService.browserViewGoBack();
      this.getBrowserViewState();
    }
  }

  close() {

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

  forward() {
    if (this.canGoForward) {
      this.ipcService.browserViewGoForward();
      this.getBrowserViewState();
    }
  }

  getBrowserViewState() {
    // let p = [this.ipcService.browserViewCanGoBack(), this.ipcService.browserViewCanGoForward(),]
    // Promise.all(p).then((results) => {
    //   this.canGoBack = results[0];
    //   this.canGoForward = results[1];
    // });
    //
    // this.ipcService.browserViewCurrentUrl().then((value) => {
    //   this.displayUrl = value;
    //
    //   // TODO: reenable this to allow saving KS
    //   // if (typeof this.ks.accessLink === 'string') {
    //   //   this.saveDisabled = this.ks.accessLink === value;
    //   // } else {
    //   //   this.saveDisabled = this.ks.accessLink.href === value;
    //   // }
    // });
  }

  onBrowserViewNavEvent(electronNavEvent: string) {
    this.getBrowserViewState();
  }

  onIpcResponse(response: IpcResponse) {
    if (response.error) {
      // TODO: show a more meaningful error and possibly try to resolve...
      console.error(response.error);
      this.close();
    }
  }

  refresh() {
    this.ipcService.browserViewRefresh();
  }

  save() {
    console.log('Saving url: ', this.displayUrl);
    // TODO: there should be a service that creates KS automatically from link...
  }

  setViewReady(viewReady: any) {
    console.log('View ready: ', viewReady);
    this.viewReady = viewReady;
  }


}
