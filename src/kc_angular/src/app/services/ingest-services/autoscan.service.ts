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
import {BehaviorSubject, Observable} from "rxjs";
import {IpcMessage} from "../../../../../kc_shared/models/electron.ipc.model";
import {FileSourceModel, FileWatcherUpdate} from "../../../../../kc_shared/models/file.source.model";
import {UUID} from "../../../../../kc_shared/models/uuid.model";
import {NotificationsService} from "../user-services/notifications.service";

type FileManagerMove = {
  id: string,
  newPath: string
}

@Injectable({
  providedIn: 'root'
})
export class AutoscanService {
  private send = window.api.send;
  private receive = window.api.receive;
  private channels = {
    fmNewFiles: 'E2A:FileManager:NewFiles',
    fmError: 'E2A:FileManager:Error',
    fmDelete: 'A2E:Autoscan:Delete',
    fmFinalize: `A2E:Autoscan:Finalize`,
    fmWarn: 'E2A:FileManager:Warn',
    fmConfirmAdd: 'E2A:FileManager:ConfirmAdd'
  }

  private __files = new BehaviorSubject<FileSourceModel[]>([]);
  files: Observable<FileSourceModel[]> = this.__files.asObservable();

  private __move = new BehaviorSubject<FileManagerMove>({} as any);
  move = this.__move.asObservable();

  constructor(private zone: NgZone,
              private notifications: NotificationsService) {
    this.receive(this.channels.fmNewFiles, (responses: IpcMessage[]) => {
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
        this.__files.next(files);
      });
    })

    this.receive(this.channels.fmError, (message: IpcMessage) => {
      this.zone.run(() => {
        if (message.error) {
          this.notifications.error('FileWatcher', `${message.error.label}`, `${message.error.message} (${message.error.code})`);
        }
      })
    })

    this.receive(this.channels.fmWarn, (message: IpcMessage) => {
      this.zone.run(() => {
        if (message.error) {
          this.notifications.warn('FileWatcher', `${message.error.label}`, `${message.error.message}`);
        }
      })
    })

    this.receive(this.channels.fmConfirmAdd, (message: IpcMessage) => {
      console.log('Confirm add: ', message);
      if (message.success?.data?.id && message.success.data.newPath) {
        this.__move.next(message.success.data);
      }
    })
  }

  /**
   *
   * @param id
   * @param operation:
   */
  finalize(id: UUID, operation: 'add' | 'remove' | 'delay') {
    const update: FileWatcherUpdate = {
      id: id.value,
      method: operation
    }
    this.send(this.channels.fmFinalize, update);
  }

  delete(path: string) {
    this.send(this.channels.fmDelete, path);
  }
}
