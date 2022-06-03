import {Injectable, NgZone} from '@angular/core';
import {BehaviorSubject, Observable} from "rxjs";
import {IpcMessage} from "kc_electron/src/app/models/electron.ipc.model";
import {FileSourceModel} from "../../../../../../kc_shared/models/file.source.model";

/**
 * File Watcher Update
 * id: Knowledge Source in uuidv4 format
 * operation: add (
 */
interface FileWatcherUpdate {
  id: string,
  operation: 'add' | 'delete' | 'delay'
}

@Injectable({
  providedIn: 'root'
})
export class FileWatcherService {
  private send = window.api.send;
  private receive = window.api.receive;
  private receiveOnce = window.api.receiveOnce;
  private removeAllListeners = window.api.removeAllListeners;
  private channels = {
    fwNewFiles: 'E2A:FileWatcher:NewFiles',
    fwError: 'E2A:FileWatcher:Error',
    fwDelete: 'A2E:FileWatcher:Delete',
    fwFinalize: `A2E:FileWatcher:Finalize`,
    fwWarn: 'E2A:FileWatcher:Warn'
  }

  private __files = new BehaviorSubject<FileSourceModel[]>([]);
  files: Observable<FileSourceModel[]> = this.__files.asObservable();

  constructor(private zone: NgZone) {
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

  finalize(update: FileWatcherUpdate) {
    this.send(this.channels.fwFinalize, update);
  }
}
