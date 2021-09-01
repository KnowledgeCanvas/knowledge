import {Injectable} from '@angular/core';
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
    closeBrowserView: 'electron-close-browser-view',
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

  constructor() {
  }

  closeBrowserView() {
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
        resolve(icons);
      });
      this.send(this.channels.getFileIcon, paths);
    })
  }

  getFileThumbnail(requests: KsThumbnailRequest[]): Promise<any[]> {
    return new Promise<any[]>((resolve, reject) => {
      if (requests.length < 1)
        reject();

      this.receive(this.channels.getFileThumbnailResults, (responses: IpcResponse[]) => {
        let thumbnails: any[] = [];
        for (let response of responses) {
          if (response.success?.data) {
            thumbnails.push(response.success.data);
          }
        }
        resolve(thumbnails);
      });
      this.send(this.channels.getFileThumbnail, requests);
    });
  }


  promptForDirectory(request: PromptForDirectoryRequest): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this.receive(this.channels.promptForDirectoryResults, (response: IpcResponse) => {
        console.log('Received prompt for directory response: ', response);
        if (response.error) {
          console.error(response.error);
          reject(response.error);
        }

        if (response.success) {
          resolve(response.success.data);
        }

      });

      this.send(this.channels.promptForDirectory, request);
    });
  }

  openBrowserView(request: KsBrowserViewRequest): Promise<IpcResponse> {
    return new Promise<IpcResponse>((resolve) => {
      this.receive(this.channels.browserViewResults, (response: IpcResponse) => {
        resolve(response);
      });
      this.send(this.channels.browserView, request);
    });
  }

  openLocalFile(path: string): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.receive(this.channels.openLocalFileResults, (response: IpcResponse) => {
        if (response.success?.data) {
          resolve(true);
        } else {
          resolve(false);
        }
      });

      this.send(this.channels.openLocalFile, path);
    });
  }

  getSettingsFile(): Observable<SettingsModel> {
    return new Observable<SettingsModel>(subscriber => {
      window.api.receive("app-get-settings-results", (data: any) => {
        subscriber.next(data);
      });
      window.api.send("app-get-settings", {});
    });
  }

  saveSettingsFile(settings: SettingsModel): Observable<SettingsModel> {
    return new Observable<SettingsModel>(subscriber => {
      window.api.receive("app-save-settings-results", (data: any) => {
        subscriber.next(data);
      });
      window.api.send("app-save-settings", settings);
    });
  }

  generateUuid(quantity: number): Promise<UuidModel[]> {
    return new Promise<UuidModel[]>((resolve, reject) => {
      this.receive(this.channels.generateUuidResults, (response: IpcResponse) => {
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
      this.send(this.channels.generateUuid, {quantity: quantity});
    });
  }

  ingestWatcher(): Observable<FileModel[]> {
    return new Observable<FileModel[]>((subscriber) => {
      this.receive(this.channels.ingestWatcherResults, (responses: IpcResponse[]) => {
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
  }

}
