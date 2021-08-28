import {Injectable} from '@angular/core';
import {UuidModel} from "../../../../../shared/src/models/uuid.model";

export interface IpcSuccess {
  message?: string;
  data?: any;
}

export interface IpcError {
  code: number;
  label: string;
  message: string;
}

export interface IpcResponse {
  error: IpcError | undefined;
  success: IpcSuccess | undefined;
}

export interface KcUuidRequest {
  quantity: number
}

export interface KsBrowserViewRequest {
  url: string,
  x: number,
  y: number,
  height: number,
  width: number
}

export interface BrowserViewRequest {
  url: string,
  x: number,
  y: number,
  width: number,
  height: number
}

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
    generateUuid: 'app-generate-uuid'
  }

  // window.api.send("electron-browser-view", args);

  constructor() {
  }

  closeBrowserView() {
    this.send(this.channels.closeBrowserView);
  }

  openBrowserView(request: BrowserViewRequest): Promise<IpcResponse> {
    return new Promise<IpcResponse>((resolve) => {
      this.receive(this.channels.browserViewResults, (response: IpcResponse) => {
        resolve(response);
      });
      window.api.send(this.channels.browserView, request);
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
