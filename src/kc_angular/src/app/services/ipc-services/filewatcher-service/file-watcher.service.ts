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
import {IpcMessage} from "kc_electron/src/app/models/electron.ipc.model";
import {FileSourceModel, FileWatcherUpdate} from "../../../../../../kc_shared/models/file.source.model";
import {UUID} from "../../../models/uuid";
import {NotificationsService} from "../../user-services/notification-service/notifications.service";


@Injectable({
  providedIn: 'root'
})
export class FileWatcherService {
  private send = window.api.send;
  private receive = window.api.receive;
  private channels = {
    fwNewFiles: 'E2A:FileWatcher:NewFiles',
    fwError: 'E2A:FileWatcher:Error',
    fwDelete: 'A2E:FileWatcher:Delete',
    fwFinalize: `A2E:FileWatcher:Finalize`,
    fwWarn: 'E2A:FileWatcher:Warn'
  }

  private __files = new BehaviorSubject<FileSourceModel[]>([]);
  files: Observable<FileSourceModel[]> = this.__files.asObservable();

  constructor(private zone: NgZone, private notifications: NotificationsService) {
    this.receive(this.channels.fwNewFiles, (responses: IpcMessage[]) => {
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

    this.receive(this.channels.fwError, (message: IpcMessage) => {
      this.zone.run(() => {
        if (message.error) {
          this.notifications.error('FileWatcher', `${message.error.label}`, `${message.error.message} (${message.error.code})`);
        }
      })
    })

    this.receive(this.channels.fwWarn, (message: IpcMessage) => {
      this.zone.run(() => {
        if (message.error) {
          this.notifications.warn('FileWatcher', `${message.error.label}`, `${message.error.message}`);
        }
      })
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
    this.send(this.channels.fwFinalize, update);
  }

  delete(path: string) {
    this.notifications.warn('FileWatcher', 'Deleting File', path);
    this.send(this.channels.fwDelete, path);
  }
}
