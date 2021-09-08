import {Injectable, NgZone} from '@angular/core';
import {UuidModel} from "projects/ks-lib/src/lib/models/uuid.model";
import {BehaviorSubject, Observable} from 'rxjs';
import {SettingsModel} from "projects/ks-lib/src/lib/models/settings.model";
import {IpcResponse, KsBrowserViewRequest, KsThumbnailRequest} from "kc_electron/src/app/models/electron.ipc.model";
import {FileModel} from "../../models/file.model";

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
    browserExtensionResults: 'app-chrome-extension-results',
    browserView: 'electron-browser-view',
    browserViewCanGoBack: 'electron-browser-view-can-go-back',
    browserViewCanGoBackResults: 'electron-browser-view-can-go-back-results',
    browserViewCanGoForward: 'electron-browser-view-can-go-forward',
    browserViewCanGoForwardResults: 'electron-browser-view-can-go-forward-results',
    browserViewCurrentUrl: 'electron-browser-view-current-url',
    browserViewCurrentUrlResults: 'electron-browser-view-current-url-results',
    browserViewGoBack: 'electron-browser-view-go-back',
    browserViewGoForward: 'electron-browser-view-go-forward',
    browserViewNavEvents: 'electron-browser-view-nav-events',
    browserViewRefresh: 'electron-browser-view-refresh',
    browserViewResults: 'electron-browser-view-results',
    closeBrowserView: 'electron-close-browser-view',
    closeBrowserViewResults: 'electron-close-browser-view-results',
    generateUuid: 'app-generate-uuid',
    generateUuidResults: 'app-generate-uuid-results',
    getFileIcon: 'electron-get-file-icon',
    getFileIconResults: 'electron-get-file-icon-results',
    getFileThumbnail: 'electron-get-file-thumbnail',
    getFileThumbnailResults: 'electron-get-file-thumbnail-results',
    getSettings: 'app-get-settings',
    getSettingsResults: 'app-get-settings-results',
    ingestWatcherResults: 'app-ingest-watcher-results',
    openLocalFile: 'electron-open-local-file',
    openLocalFileResults: 'electron-open-local-file-results',
    promptForDirectory: 'app-prompt-for-directory',
    promptForDirectoryResults: 'app-prompt-for-directory-results',
    saveSettings: 'app-save-settings',
    saveSettingsResults: 'app-save-settings-results'
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

  constructor(private zone: NgZone) {
    this.receive(this.channels.browserViewNavEvents, (response: IpcResponse) => {
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
    this.receive(this.channels.browserViewCanGoBackResults, (response: IpcResponse) => {
      this.zone.run(() => {
        if (response.success)
          this._bvCanGoBack.next(response.success.data);
      });
    });

    this.receive(this.channels.browserViewCanGoForwardResults, (response: IpcResponse) => {
      this.zone.run(() => {
        if (response.success)
          this._bvCanGoForward.next(response.success.data);
      });
    });

    this.receive(this.channels.browserViewCurrentUrlResults, (response: IpcResponse) => {
      this.zone.run(() => {
        if (response.success)
          this._bvUrl.next(response.success.data);
      });
    });
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

    this.receiveOnce(this.channels.closeBrowserViewResults, (response: IpcResponse) => {
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
      this.receiveOnce(this.channels.getFileIconResults, (responses: IpcResponse[]) => {
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

  getFileThumbnail(requests: KsThumbnailRequest[]): Promise<any[]> {
    return new Promise<any[]>((resolve, reject) => {
      if (requests.length < 1)
        reject();

      this.receiveOnce(this.channels.getFileThumbnailResults, (responses: IpcResponse[]) => {
        this.removeAllListeners(this.channels.getFileThumbnailResults);
        this.zone.run(() => {
          let thumbnails: any[] = [];
          for (let response of responses) {
            if (response.success?.data) {
              thumbnails.push(response.success.data);
            } else if (response.error) {
              reject(response.error);
            }
          }
          resolve(thumbnails);
        });
      });
      this.send(this.channels.getFileThumbnail, requests);
    });
  }

  promptForDirectory(request: PromptForDirectoryRequest): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this.receiveOnce(this.channels.promptForDirectoryResults, (response: IpcResponse) => {
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

  openBrowserView(request: KsBrowserViewRequest): Promise<IpcResponse> {
    return new Promise<IpcResponse>((resolve) => {
      this.receiveOnce(this.channels.browserViewResults, (response: IpcResponse) => {
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
      this.receiveOnce(this.channels.openLocalFileResults, (response: IpcResponse) => {
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

  generateUuid(quantity: number): Promise<UuidModel[]> {
    return new Promise<UuidModel[]>((resolve, reject) => {
      this.receiveOnce(this.channels.generateUuidResults, (response: IpcResponse) => {
        this.removeAllListeners(this.channels.generateUuidResults);
        this.zone.run(() => {
          if (response.success?.data) {
            let uuids: UuidModel[] = [];
            for (let id of response.success.data) {
              let uuid = new UuidModel(id);
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

  ingestWatcher(): Observable<FileModel[]> {
    return new Observable<FileModel[]>((subscriber) => {
      this.receive(this.channels.ingestWatcherResults, (responses: IpcResponse[]) => {
        this.zone.run(() => {
          let files: FileModel[] = [];

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

  /**
   *
   */
  browserWatcher(): Observable<string> {
    return new Observable<string>((subscriber) => {
      this.receive(this.channels.browserExtensionResults, (response: IpcResponse) => {
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

  /**
   * This function acts as a "de-bouncer" on browser view navigation actions
   * In other words, it prevents users from clicking the button so quick that state cannot be maintained properly
   * This is necessary because Electron appears to fall out of sync if a user presses "back" or "forward" to quickly
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
