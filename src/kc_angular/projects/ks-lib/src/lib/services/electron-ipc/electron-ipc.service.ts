import {Injectable, NgZone} from '@angular/core';
import {UuidModel} from "projects/ks-lib/src/lib/models/uuid.model";
import {Observable} from 'rxjs';
import {SettingsModel} from "projects/ks-lib/src/lib/models/settings.model";
import {IpcResponse, KsBrowserViewRequest, KsThumbnailRequest} from "kc_electron/src/app/models/electron.ipc.model";
import {FileModel} from "../../models/file.model";

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
  private channels = {
    browserView: 'electron-browser-view',
    browserViewResults: 'electron-browser-view-results',
    browserExtensionResults: 'app-chrome-extension-results',
    closeBrowserView: 'electron-close-browser-view',
    closeBrowserViewResults: 'electron-close-browser-view-results',
    generateUuidResults: 'app-generate-uuid-results',
    generateUuid: 'app-generate-uuid',
    getFileIcon: 'electron-get-file-icon',
    getFileIconResults: 'electron-get-file-icon-results',
    getFileThumbnail: 'electron-get-file-thumbnail',
    getFileThumbnailResults: 'electron-get-file-thumbnail-results',
    ingestWatcherResults: 'app-ingest-watcher-results',
    openLocalFile: 'electron-open-local-file',
    openLocalFileResults: 'electron-open-local-file-results',
    promptForDirectory: 'app-prompt-for-directory',
    promptForDirectoryResults: 'app-prompt-for-directory-results'
  }

  constructor(private zone: NgZone) {
  }

  closeBrowserView() {
    this.receive(this.channels.closeBrowserViewResults, (response: IpcResponse) => {
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
      this.receive(this.channels.getFileIconResults, (responses: IpcResponse[]) => {
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

      this.receive(this.channels.getFileThumbnailResults, (responses: IpcResponse[]) => {
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
      this.receive(this.channels.promptForDirectoryResults, (response: IpcResponse) => {
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
      this.receive(this.channels.browserViewResults, (response: IpcResponse) => {
        this.zone.run(() => {
          resolve(response);
        });
      });
      this.send(this.channels.browserView, request);
    });
  }

  openLocalFile(path: string): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.receive(this.channels.openLocalFileResults, (response: IpcResponse) => {
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
      this.receive("app-get-settings-results", (data: any) => {
        this.zone.run(() => {
          subscriber.next(data);
        });
      });
      this.send("app-get-settings", {});
    });
  }

  saveSettingsFile(settings: SettingsModel): Observable<SettingsModel> {
    return new Observable<SettingsModel>(subscriber => {
      this.receive("app-save-settings-results", (data: any) => {
        this.zone.run(() => {
          subscriber.next(data);
        });
      });
      this.send("app-save-settings", settings);
    });
  }

  generateUuid(quantity: number): Promise<UuidModel[]> {
    return new Promise<UuidModel[]>((resolve, reject) => {
      this.receive(this.channels.generateUuidResults, (response: IpcResponse) => {
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
}
