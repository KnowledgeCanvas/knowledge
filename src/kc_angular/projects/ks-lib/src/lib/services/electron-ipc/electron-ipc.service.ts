import {Injectable} from '@angular/core';
import {UuidModel} from "../../../../../shared/src/models/uuid.model";
import {Observable} from 'rxjs';
import {SettingsModel} from "../../../../../shared/src/models/settings.model";
import {BrowserViewRequest, IpcResponse} from "../../interfaces/electron-ipc-models/electron.ipc.model";
import {KsThumbnailRequest} from "kc_electron/src/app/model/ipc.model";

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
    openLocalFile: 'electron-open-local-file',
    getFileIcon: 'electron-get-file-icon',
    getFileIconResults: 'electron-get-file-icon-results',
    getFileThumbnail: 'electron-get-file-thumbnail',
    getFileThumbnailResults: 'electron-get-file-thumbnail-results'
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

  openBrowserView(request: BrowserViewRequest): Promise<IpcResponse> {
    return new Promise<IpcResponse>((resolve) => {
      this.receive(this.channels.browserViewResults, (response: IpcResponse) => {
        resolve(response);
      });
      this.send(this.channels.browserView, request);
    });
  }

  openLocalFile(path: string) {
    console.log('Attempting to open file: ', path);
    this.send(this.channels.openLocalFile, path);
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
}
