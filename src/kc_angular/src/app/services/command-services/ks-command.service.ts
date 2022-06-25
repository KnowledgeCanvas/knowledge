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

import {Injectable} from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {KnowledgeSource} from "../../models/knowledge.source.model";
import {ElectronIpcService} from "../ipc-services/electron-ipc.service";
import {Clipboard} from "@angular/cdk/clipboard";
import {NotificationsService} from "../user-services/notifications.service";
import {ProjectService} from "../factory-services/project.service";
import {ProjectUpdateRequest} from "../../models/project.model";
import {BrowserViewDialogService} from "../ipc-services/browser-view-dialog.service";
import {ConfirmationService} from "primeng/api";

@Injectable({
  providedIn: 'root'
})
export class KsCommandService {

  private _ksDetailEvent = new BehaviorSubject<KnowledgeSource | undefined>(undefined);
  ksDetailEvent = this._ksDetailEvent.asObservable();

  private _ksOpenEvent = new BehaviorSubject<KnowledgeSource | undefined>(undefined);
  ksOpenEvent = this._ksOpenEvent.asObservable();

  private _ksRemoveEvent = new BehaviorSubject<KnowledgeSource[]>([]);
  ksRemoveEvent = this._ksRemoveEvent.asObservable();

  private _ksMoveEvent = new BehaviorSubject<KnowledgeSource[]>([]);
  ksMoveEvent = this._ksMoveEvent.asObservable();

  private _ksShareEvent = new BehaviorSubject<KnowledgeSource[]>([]);
  ksShareEvent = this._ksShareEvent.asObservable();

  private _ksUpdateEvent = new BehaviorSubject<KnowledgeSource[]>([]);
  ksUpdateEvent = this._ksUpdateEvent.asObservable();

  private _ksShowInFilesEvent = new BehaviorSubject<KnowledgeSource>({} as any);
  ksShowInFilesEvent = this._ksShowInFilesEvent.asObservable();

  constructor(private ipc: ElectronIpcService,
              private browser: BrowserViewDialogService,
              private confirmation: ConfirmationService,
              private clipboard: Clipboard,
              private notifications: NotificationsService,
              private projects: ProjectService
  ) {
  }

  update(ksList: KnowledgeSource[]) {
    this._ksUpdateEvent.next(ksList);
  }

  remove(ksList: KnowledgeSource[]) {
    if (ksList.length <= 0) {
      return;
    }

    this.confirmation.confirm({
      message: `Are you sure you want to remove ${ksList.length} Knowledge Sources?`,
      accept: () => {
        // TODO: if the KS points to a local file, ask the user what they want to be done with the file...
        let updates: ProjectUpdateRequest[] = [];

        ksList.forEach((ks) => {
          let proj = updates.find(p => p.id.value === ks.associatedProject.value);
          if (proj) {
            if (proj.removeKnowledgeSource) {
              proj.removeKnowledgeSource.push(ks);
            }
          } else {
            updates.push({
              id: ks.associatedProject,
              removeKnowledgeSource: [ks]
            })
          }
        });
        this.projects.updateProjects(updates);
      }
    });

    this._ksRemoveEvent.next(ksList);
  }

  move(ksList: KnowledgeSource[]) {
    this._ksMoveEvent.next(ksList);
  }

  preview(ks: KnowledgeSource) {
    this.onKsPreview(ks);
  }

  detail(ks: KnowledgeSource) {
    this._ksDetailEvent.next(ks);
  }

  share(ksList: KnowledgeSource[]) {
    this._ksShareEvent.next(ksList);
  }

  open(ks: KnowledgeSource) {
    if (ks.ingestType === 'file' && typeof ks.accessLink === 'string') {
      this.ipc.openLocalFile(ks.accessLink).then((result) => {
        if (result) {
          this.notifications.success('KnowledgeCanvas', 'File Opened', ks.title);
        } else {
          this.notifications.error('KnowledgeCanvas', 'Failed to Open', ks.title);
        }
      });
    } else {
      window.open(typeof ks.accessLink === 'string' ? ks.accessLink : ks.accessLink.href);
      this.notifications.success('KnowledgeCanvas', 'Link Opened', ks.title);
    }

    if (!ks.events) {
      ks.events = [];
    }

    ks.events.push({
      date: new Date(),
      label: "Accessed"
    })
  }

  copyPath(ksList: KnowledgeSource[]) {
    if (ksList.length <= 0) {
      return;
    }
    let paths = [];
    for (let ks of ksList) {
      paths.push(typeof ks.accessLink === 'string' ? ks.accessLink : ks.accessLink.href);
    }
    this.clipboard.copy(paths.join('\n'));
    this.notifications.success('Source Command Service', 'Copied to Clipboard!', '');
  }

  copyJSON(ksList: KnowledgeSource[]) {
    if (ksList.length <= 0) {
      return;
    }

    let ksStr: string = '';
    try {
      ksStr = JSON.stringify(ksList)
      this.clipboard.copy(ksStr);
      this.notifications.success('Source Command Service', 'Copied to Clipboard!', '');
    } catch (e) {
      return;
    }
  }

  showInFiles(ks: KnowledgeSource) {
    if (typeof ks.accessLink !== 'string') {
      return;
    }
    this.ipc.showItemInFolder(ks.accessLink)
    this._ksShowInFilesEvent.next(ks);
  }

  private async onKsPreview(ks: KnowledgeSource) {
    const dialogRef = this.browser.open({ks: ks});

    if (dialogRef === undefined) {
      this.notifications.warn('KsPreview', 'Unsupported File Type', 'Opening with default application instead.');
      this.open(ks);
      return;
    }

    const textExtractor = this.ipc.extractedText.subscribe((data) => {
      const text = data.text.trim();
      if (text !== '' && data.url.includes(typeof ks.accessLink === 'string' ? ks.accessLink : ks.accessLink.href)) {
        if (!ks.description.includes(data.text)) {
          ks.description += data.text + '\n\n';
        }
      }
    })

    let closed = false;
    dialogRef?.onClose.subscribe((result) => {
      if (!result) {
        return;
      }

      if (!closed) {
        textExtractor.unsubscribe();
        try {
          if (ks.associatedProject) {
            let update: ProjectUpdateRequest = {
              id: ks.associatedProject,
              updateKnowledgeSource: [ks]
            }
            this.projects.updateProjects([update]);
          }
        } catch (e) {
          this.notifications.warn('Source Command Service', 'Invalid Project', 'Unable to update project after closing the preview dialog...');
        }

        closed = true;
      }
    });
  }
}
