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
import {DataService} from "../user-services/data.service";
import {DialogService, DynamicDialogRef} from "primeng/dynamicdialog";
import {KsMoveComponent} from "../../components/source-components/ks-move.component";

@Injectable({
  providedIn: 'root'
})
export class KsCommandService {

  private _ksDetailEvent = new BehaviorSubject<KnowledgeSource & { force: boolean } | undefined>(undefined);
  ksDetailEvent = this._ksDetailEvent.asObservable();

  private _ksShareEvent = new BehaviorSubject<KnowledgeSource[]>([]);
  ksShareEvent = this._ksShareEvent.asObservable();

  private _ksShowInFilesEvent = new BehaviorSubject<KnowledgeSource>({} as any);
  ksShowInFilesEvent = this._ksShowInFilesEvent.asObservable();

  private moveDialogRef?: DynamicDialogRef;

  constructor(private ipc: ElectronIpcService,
              private data: DataService,
              private browser: BrowserViewDialogService,
              private dialog: DialogService,
              private confirmation: ConfirmationService,
              private clipboard: Clipboard,
              private notifications: NotificationsService,
              private projects: ProjectService) {
  }

  update(ksList: KnowledgeSource[], notify: boolean = true) {
    this.data.sources.update(ksList).then(() => {
      if (notify) {
        this.notifications.success('Source Command', `Source${ksList.length > 1 ? 's' : ''} Updated`, ksList.map(k => k.title).join(', '));
      }
    });
  }

  remove(ksList: KnowledgeSource[]) {
    if (ksList.length <= 0) {
      return;
    }

    this.confirmation.confirm({
      message: `Permanently remove ${ksList.length === 1 ? ksList[0].title : `${ksList.length} Sources`}?`,
      header: `Remove Source${ksList.length === 1 ? '' : 's'}`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Remove',
      rejectLabel: 'Keep',
      acceptButtonStyleClass: 'p-button-text p-button-danger',
      rejectButtonStyleClass: 'p-button-text',
      acceptIcon: 'pi pi-trash',
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
  }

  move(ksList: KnowledgeSource[]) {
    if (this.moveDialogRef) {
      return;
    }

    this.moveDialogRef = this.dialog.open(KsMoveComponent, {
      data: {ksList: ksList},
      width: 'min(90vw, 92rem)',
      height: 'min(60vh, 72rem)',
      showHeader: true,
      header: 'Move',
      modal: true,
      contentStyle: {
        'border-bottom-left-radius': '6px',
        'border-bottom-right-radius': '6px'
      },
      closeOnEscape: true
    })

    this.moveDialogRef.onClose.subscribe(() => {
      this.moveDialogRef = undefined;
    })
  }

  preview(ks: KnowledgeSource) {
    this.onKsPreview(ks);
  }

  detail(ks: KnowledgeSource, force: boolean = false) {
    this._ksDetailEvent.next({...ks, ...{force: force}});
  }

  share(ksList: KnowledgeSource[]) {
    this._ksShareEvent.next(ksList);
  }

  open(ks: Partial<KnowledgeSource>) {
    if (ks.ingestType === 'file' && typeof ks.accessLink === 'string') {
      this.ipc.openLocalFile(ks.accessLink).then((result) => {
        if (result) {
          this.notifications.success('Source Command', 'File Opened', ks.title ?? '');
        } else {
          this.notifications.error('Source Command', 'Failed to Open', ks.title ?? '');
        }
      });
    } else if (ks && ks.accessLink) {
      window.open(typeof ks.accessLink === 'string' ? ks.accessLink : ks.accessLink.href);
      this.notifications.success('Source Command', 'Link Opened', ks.title ?? '');
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
    this.notifications.success('Source Command', 'Copied to Clipboard!', '');
  }

  copyJSON(ksList: KnowledgeSource[]) {
    if (ksList.length <= 0) {
      return;
    }

    let ksStr: string = '';
    try {
      ksStr = JSON.stringify(ksList)
      this.clipboard.copy(ksStr);
      this.notifications.success('Source Command', 'Copied to Clipboard!', '');
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
      this.notifications.warn('Source Command', 'Unsupported File Type', 'Opening with default application instead.');
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
          this.notifications.warn('Source Command', 'Invalid Project', 'Unable to update project after closing the preview dialog...');
        }

        closed = true;
      }
    });
  }
}
