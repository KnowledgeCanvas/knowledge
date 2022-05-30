import {Injectable, NgZone} from '@angular/core';
import {BehaviorSubject, Observable} from "rxjs";
import {FileModel} from "../../../models/file.model";
import {IpcMessage} from "kc_electron/src/app/models/electron.ipc.model";

interface FileWatcherUpdate {
  id: string,
  operation: 'add' | 'delete' | 'delay'
}

@Injectable({
  providedIn: 'root'
})
export class FileWatcherIpcService {
  private send = window.api.send;
  private receive = window.api.receive;
  private receiveOnce = window.api.receiveOnce;
  private removeAllListeners = window.api.removeAllListeners;
  private channels = {
    ingestWatcherResults: 'E2A:FileWatcher:NewFiles',
    ingestWatcherFinalize: `A2E:FileWatcher:Finalize`
  }

  private __files = new BehaviorSubject<FileModel[]>([]);
  files: Observable<FileModel[]> = this.__files.asObservable();

  constructor(private zone: NgZone) {
    this.receive(this.channels.ingestWatcherResults, (responses: IpcMessage[]) => {
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
        this.__files.next(files);
      });
    })
  }

  finalize(update: FileWatcherUpdate) {
    this.send(this.channels.ingestWatcherFinalize, update);
  }
}
