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

import {Injectable, NgZone} from '@angular/core';

import {BehaviorSubject, Observable} from 'rxjs';
import {IpcMessage, KcDialogRequest, KsBrowserViewRequest, KsThumbnailRequest} from "kc_electron/src/app/models/electron.ipc.model";
import {SettingsModel} from "../../../../../../kc_shared/models/settings.model";
import {FileSourceModel} from "../../../../../../kc_shared/models/file.source.model";
import {UUID} from "../../../models/uuid.model";

export interface ElectronNavEvent {
  stack: string[]
}

export interface PromptForDirectoryRequest {
  title?: string;
  defaultPath?: string;
  buttonLabel?: string;
  filters?: any[];
  properties?: PromptForDirectoryProperties[];
  macOsMessage?: string;
  macOsSecurityScopedBookmarks?: boolean;
}

export type PromptForDirectoryProperties = 'openFile' | 'openDirectory' | 'multiSelections' | 'showHiddenFiles'
  | 'createDirectory' | 'promptToCreate' | 'noResolveAliases' | 'treatPackageAsDirectory' | 'dontAddToRecent'

@Injectable({
  providedIn: 'root'
})
export class ElectronIpcService {
  private ClassName = 'ElectronIpcService';
  private send = window.api.send;
  private receive = window.api.receive;
  private receiveOnce = window.api.receiveOnce;
  private removeAllListeners = window.api.removeAllListeners;
  private channels = {
    autoUpdateReceive: 'E2A:AutoUpdate:Update',
    browserExtensionResults: 'E2A:Extension:Import',
    browserView: 'A2E:BrowserView:Open',
    browserViewCanGoBack: 'A2E:BrowserView:CanGoBack',
    browserViewCanGoBackResults: 'E2A:BrowserView:CanGoBack',
    browserViewCanGoForward: 'A2E:BrowserView:CanGoForward',
    browserViewCanGoForwardResults: 'E2A:BrowserView:CanGoForward',
    browserViewCurrentUrl: 'A2E:BrowserView:CurrentUrl',
    browserViewCurrentUrlResults: 'E2A:BrowserView:CurrentUrl',
    browserViewGoBack: 'A2E:BrowserView:GoBack',
    browserViewGoForward: 'A2E:BrowserView:GoForward',
    browserViewNavEvents: 'E2A:BrowserView:NavEvent',
    browserViewRefresh: 'A2E:BrowserView:Refresh',
    browserViewResults: 'E2A:BrowserView:Open',
    checkCurrentVersion: 'A2E:Version:Get',
    checkCurrentVersionResults: 'E2A:Version:Get',
    checkForUpdates: 'A2E:AutoUpdate:Check',
    checkForUpdatesResults: 'E2A:AutoUpdate:Check',
    closeBrowserView: 'A2E:BrowserView:Close',
    closeBrowserViewResults: 'E2A:BrowserView:Close',
    generateUuid: 'A2E:Uuid:Generate',
    generateUuidResults: 'E2A:Uuid:Generate',
    getFileIcon: 'A2E:FileSystem:FileIcon',
    getFileIconResults: 'E2A:FileSystem:FileIcon',
    getFileThumbnail: 'A2E:FileSystem:FileThumbnail',
    getFileThumbnailResults: 'E2A:FileSystem:FileThumbnail',
    getSettings: 'A2E:Settings:Get',
    getSettingsResults: 'E2A:Settings:Get',
    ingestWatcherResults: 'E2A:FileWatcher:NewFiles',
    openLocalFile: 'A2E:FileSystem:OpenFile',
    openLocalFileResults: 'E2A:FileSystem:OpenFile',
    openKcDialog: 'A2E:KnowledgeCanvas:Open',
    openKcDialogResults: 'E2A:KnowledgeCanvas:Open',
    promptForDirectory: 'A2E:FileSystem:DirectoryPrompt',
    promptForDirectoryResults: 'E2A:FileSystem:DirectoryPrompt',
    saveSettings: 'A2E:Settings:Set',
    saveSettingsResults: 'E2A:Settings:Set',
    showItemInFolder: 'A2E:FileSystem:ShowFile',
    showItemInFolderResults: 'E2A:FileSystem:ShowFile'
  }

  receiveChannels = {
    browserViewExtractText: 'E2A:BrowserView:ExtractedText'
  }

  // Subscribers will be alerted when the browser view navigates to a new URL
  private browserViewNavEvent = new BehaviorSubject<string>('');
  navEvent = this.browserViewNavEvent.asObservable();

  // Subscribers will be alerted when the browser view state is changed
  private _bvCanGoBack = new BehaviorSubject<boolean>(false);
  browserViewCanGoBackResult = this._bvCanGoBack.asObservable();

  private _bvCanGoForward = new BehaviorSubject<boolean>(false);
  browserViewCanGoForwardResult = this._bvCanGoForward.asObservable();

  private _bvUrl = new BehaviorSubject<string>('');
  browserViewCurrentUrlResult = this._bvUrl.asObservable();

  private _bvStateTimer: any = Date.now()

  private _currentVersion = new BehaviorSubject<string>('');
  version = this._currentVersion.asObservable();

  private _thumbnails = new BehaviorSubject<{ id: string, thumbnail: any }>({id: '', thumbnail: undefined});
  thumbnail = this._thumbnails.asObservable();

  private _extractedText = new BehaviorSubject<{ url: string, text: string }>({url: '', text: ''});
  extractedText = this._extractedText.asObservable();

  constructor(private zone: NgZone) {
    /**
     * Listen for auto update messages
     */
    this.receive(this.channels.autoUpdateReceive, (response: IpcMessage) => {
      console.log('Received message from auto update: ', response);
    });

    this.receive(this.channels.checkCurrentVersionResults, (response: IpcMessage) => {
      this._currentVersion.next(response.success?.data);
    });

    /**
     * Listen for incoming browser extension results
     */
    this.receive(this.channels.browserViewNavEvents, (response: IpcMessage) => {
      this.zone.run(() => {
        if (response.error) {
          console.error(response.error);
          return;
        } else if (response.success?.data) {
          let url = response.success.data;
          this.browserViewNavEvent.next(url);
        }
        this.triggerBrowserViewStateUpdate();
      });
    });

    /**
     * Pre-register call backs which will feed the above observables
     *
     */
    this.receive(this.channels.browserViewCanGoBackResults, (response: IpcMessage) => {
      this.zone.run(() => {
        if (response.success)
          this._bvCanGoBack.next(response.success.data);
      });
    });

    this.receive(this.channels.browserViewCanGoForwardResults, (response: IpcMessage) => {
      this.zone.run(() => {
        if (response.success)
          this._bvCanGoForward.next(response.success.data);
      });
    });

    this.receive(this.channels.browserViewCurrentUrlResults, (response: IpcMessage) => {
      this.zone.run(() => {
        if (response.success)
          this._bvUrl.next(response.success.data);
      });
    });

    this.receive(this.receiveChannels.browserViewExtractText, (response: any) => {
      this._extractedText.next(response);
    })

    this.receive(this.channels.getFileThumbnailResults, (response: IpcMessage[]) => {
      for (let res of response) {
        this.zone.run(() => {
          if (res.success?.data) {
            this._thumbnails.next(res.success.data);
          }
        });
      }
    });
  }

  checkForUpdates() {
    this.send(this.channels.checkForUpdates);
  }

  getCurrentVersion() {
    this.send(this.channels.checkCurrentVersion);
  }

  triggerBrowserViewStateUpdate() {
    this.send(this.channels.browserViewCanGoBack);
    this.send(this.channels.browserViewCanGoForward);
    this.send(this.channels.browserViewCurrentUrl);
  }

  browserViewGoBack() {
    if (this.canSubmitBrowserViewAction()) {
      this.send(this.channels.browserViewGoBack);
    }
  }

  browserViewGoForward() {
    if (this.canSubmitBrowserViewAction()) {
      this.send(this.channels.browserViewGoForward);
    }
  }

  browserViewRefresh() {
    if (this.canSubmitBrowserViewAction()) {
      this.send(this.channels.browserViewRefresh);
    }
  }

  closeBrowserView() {
    this.browserViewNavEvent.next('');
    this._bvCanGoBack.next(false);
    this._bvCanGoForward.next(false);
    this._bvUrl.next('');

    this.receiveOnce(this.channels.closeBrowserViewResults, (response: IpcMessage) => {
      this.removeAllListeners(this.channels.closeBrowserViewResults);
      this.zone.run(() => {
        if (response.success) {
          return response.success.data;
        } else {
          console.error('ElectronIpcService -- ', response.error);
        }
      });
    });
    this.send(this.channels.closeBrowserView);
  }

  getFileIcon(paths: string[]): Promise<any[]> {
    return new Promise<any[]>((resolve) => {
      this.receiveOnce(this.channels.getFileIconResults, (responses: IpcMessage[]) => {
        this.removeAllListeners(this.channels.getFileIconResults);
        let icons: any[] = [];
        for (let response of responses) {
          if (response.success?.data)
            icons.push(response.success.data);
        }

        this.zone.run(() => {
          resolve(icons);
        });
      });
      this.send(this.channels.getFileIcon, paths);
    });
  }

  getFileThumbnail(requests: KsThumbnailRequest[]) {
    this.send(this.channels.getFileThumbnail, requests);
  }

  promptForDirectory(request: PromptForDirectoryRequest): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this.receiveOnce(this.channels.promptForDirectoryResults, (response: IpcMessage) => {
        this.removeAllListeners(this.channels.promptForDirectoryResults);
        this.zone.run(() => {
          if (response.error) {
            console.error(response.error);
            reject(response.error);
          }
          if (response.success) {
            resolve(response.success.data);
          }
        });
      });
      this.send(this.channels.promptForDirectory, request);
    });
  }

  openBrowserView(request: KsBrowserViewRequest): Promise<IpcMessage> {
    return new Promise<IpcMessage>((resolve) => {
      this.receiveOnce(this.channels.browserViewResults, (response: IpcMessage) => {
        this.removeAllListeners(this.channels.browserViewResults);
        this.zone.run(() => {

          // Create a new stack with the current browser view URL
          // this.browserViewNavEvent.next(request.url);
          resolve(response);
        });
      });
      this.send(this.channels.browserView, request);
    });
  }

  openLocalFile(path: string): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.receiveOnce(this.channels.openLocalFileResults, (response: IpcMessage) => {
        this.removeAllListeners(this.channels.openLocalFileResults);
        this.zone.run(() => {
          if (response.success?.data) {
            resolve(true);
          } else {
            resolve(false);
          }
        });
      });
      this.send(this.channels.openLocalFile, path);
    });
  }

  openKcDialog(request: KcDialogRequest): Promise<any> {
    return new Promise<any>((_: any) => {
      this.receiveOnce(this.channels.openKcDialogResults, (response: IpcMessage) => {
        console.log('Got response from kc dialog: ', response);
      });

      this.send(this.channels.openKcDialog, request);
    });
  }

  getSettingsFile(): Observable<SettingsModel> {
    return new Observable<SettingsModel>(subscriber => {
      this.receiveOnce(this.channels.getSettingsResults, (data: any) => {
        this.removeAllListeners(this.channels.getSettingsResults);
        this.zone.run(() => {
          subscriber.next(data);
        });
      });
      this.send(this.channels.getSettings, {});
    });
  }

  saveSettingsFile(settings: SettingsModel): Observable<SettingsModel> {
    return new Observable<SettingsModel>(subscriber => {
      this.receiveOnce(this.channels.saveSettingsResults, (data: any) => {
        this.removeAllListeners(this.channels.saveSettingsResults);
        this.zone.run(() => {
          subscriber.next(data);
        });
      });
      this.send(this.channels.saveSettings, settings);
    });
  }

  generateUuid(quantity: number): Promise<UUID[]> {
    return new Promise<UUID[]>((resolve, reject) => {
      this.receiveOnce(this.channels.generateUuidResults, (response: IpcMessage) => {
        this.removeAllListeners(this.channels.generateUuidResults);
        this.zone.run(() => {
          if (response.success?.data) {
            let uuids: UUID[] = [];
            for (let id of response.success.data) {
              let uuid = new UUID(id);
              uuids.push(uuid);
            }
            resolve(uuids);
          } else {
            console.error(`${this.ClassName} error generating UUIDs: `, response.error);
            reject([]);
          }
        });
      });
      this.send(this.channels.generateUuid, {quantity: quantity});
    });
  }

  fileWatcher(): Observable<FileSourceModel[]> {
    return new Observable<FileSourceModel[]>((subscriber) => {
      this.receive(this.channels.ingestWatcherResults, (responses: IpcMessage[]) => {
        this.zone.run(() => {
          let files: FileSourceModel[] = [];

          for (let response of responses) {
            if (response.error) {
              console.error('Ignoring invalid file from ingest-watcher...');
              console.error(response.error);
            }
            if (response.success) {
              files.push(response.success.data);
            }
          }
          subscriber.next(files);
        });
      });
    });
  }

  browserWatcher(): Observable<string> {
    return new Observable<string>((subscriber) => {
      this.receive(this.channels.browserExtensionResults, (response: IpcMessage) => {
        this.zone.run(() => {
          if (response.success?.data && typeof response.success.data === 'string') {
            subscriber.next(response.success.data);
          } else {
            console.error(`${this.ClassName} error generating UUIDs: `, response.error);
            subscriber.error(response.error);
          }
        });
      });
    });
  }

  showItemInFolder(accessLink: string) {
    this.send(this.channels.showItemInFolder, accessLink);
  }

  /**
   * This function acts as a "de-bouncer" on browser view navigation actions In other words, it prevents users from
   * clicking the button so quick that state cannot be maintained properly This is necessary because Electron appears
   * to fall out of sync if a user presses "back" or "forward" to quickly..
   */
  private canSubmitBrowserViewAction(): boolean {
    if (Date.now() - this._bvStateTimer > 250) {
      this._bvStateTimer = Date.now();
      return true;
    } else {
      return false;
    }
  }
}
