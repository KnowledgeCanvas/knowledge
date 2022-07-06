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
import {Injectable, OnDestroy, SecurityContext} from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {FaviconService} from "./favicon.service";

import {SettingsService} from "../ipc-services/settings.service";
import {NotificationsService} from "../user-services/notifications.service";
import {AutoscanService} from "./autoscan.service";
import {ElectronIpcService} from "../ipc-services/electron-ipc.service";
import {KnowledgeSourceIngestTask} from "../../../../../kc_shared/models/knowledge.source.model";
import {KsFactoryService} from "../factory-services/ks-factory.service";
import {DomSanitizer} from "@angular/platform-browser";
import {ExtensionService} from "./extension.service";
import {KnowledgeSource, KnowledgeSourceReference, SourceModel} from "../../models/knowledge.source.model";
import {ProjectService} from "../factory-services/project.service";


@Injectable({
  providedIn: 'root'
})
export class IngestService implements OnDestroy {
  private _queue = new BehaviorSubject<KnowledgeSource[]>([]);
  queue = this._queue.asObservable();

  private tasks: KnowledgeSourceIngestTask[] = [];

  constructor(private favicon: FaviconService,
              private factory: KsFactoryService,
              private autoscan: AutoscanService,
              private extension: ExtensionService,
              private settings: SettingsService,
              private ipc: ElectronIpcService,
              private projects: ProjectService,
              private sanitizer: DomSanitizer,
              private notifications: NotificationsService) {
    this.autoscanSubscribe();
    this.extensionSubscribe();
  }

  ngOnDestroy() {
    for (let task of this.tasks) {
      task.callback('delay')
    }
  }

  clearResults() {
    this.notifications.debug('IngestService', `Clearing Results`, `Removing ${this._queue.value.length} Knowledge Sources`);
    for (let ks of this._queue.value) {
      this.finalize(ks, 'delay');
    }
    this._queue.next([]);
  }

  enqueue(ksList: KnowledgeSource[]) {
    for (let ks of ksList) {
      if (ks.ingestType === 'file' && this.settings.get().ingest.manager.target === 'all') {
        // TODO: if ingest manager target is "all", move all files to managed directory
      }
    }

    let ksQueue = this._queue.value;
    ksQueue = ksQueue.concat(ksList);
    this._queue.next(ksQueue);

    if (ksList.length <= 0) {
      return;
    }

    this.notifications.success('IngestService', 'Up Next', `${ksList.length} Knowledge Source${ksList.length > 1 ? 's' : ''} added.`)
  }

  add(ks: KnowledgeSource) {
    this.finalize(ks, 'add');
    this._queue.next(this._queue.value.filter(k => k.id.value !== ks.id.value));
  }

  remove(ks: KnowledgeSource) {
    this.finalize(ks, 'remove');
    this._queue.next(this._queue.value.filter(k => k.id.value !== ks.id.value));
  }

  delay(ks: KnowledgeSource) {
    this.finalize(ks, 'delay');
    this._queue.next(this._queue.value.filter(k => k.id.value !== ks.id.value));
  }

  /**
   * Subscribe to file watcher, which communicates with Electron IPC, which in turn watches a local directory for files
   * Once an extension event occurs, create a new Knowledge Source and notify listeners that a new KS is available
   *
   * TODO: Ideally, this function should use ksFactory to create KS
   */
  private autoscanSubscribe() {
    this.autoscan.files.subscribe((fileModels) => {
      let iconRequests = [];
      let ksList: KnowledgeSource[] = [];

      for (let fileModel of fileModels) {
        iconRequests.push(fileModel.path);
      }

      this.ipc.getFileIcon(iconRequests).then((icons) => {
        for (let i = 0; i < fileModels.length; i++) {
          let fileModel = fileModels[i];
          let sourceLink = fileModel.path;
          let source = new SourceModel(fileModel, undefined);
          let ref = new KnowledgeSourceReference('file', source, sourceLink);
          let ks = new KnowledgeSource(fileModel.filename, fileModel.id, 'file', ref);
          ks.dateAccessed = [];
          ks.dateModified = [];
          ks.dateCreated = new Date();
          ks.iconUrl = this.favicon.file();
          ks.icon = icons[i];
          ks.importMethod = 'autoscan';
          ksList.push(ks);

          this.tasks.push({
            id: ks.id.value,
            callback: (method: 'add' | 'remove' | 'delay') => {
              this.autoscan.finalize(ks.id, method);
            },
            method: 'autoscan'
          })
        }

        this.enqueue(ksList);
      });
    });

    this.autoscan.move.subscribe((move) => {
      this.projects.getAllProjects().then((projects) => {
        for (let project of projects) {
          const ks = project.knowledgeSource.find(k => k.id.value === move.id);
          if (ks) {
            console.log(`KS link changed from ${ks.accessLink} to ${move.newPath}`);
            ks.accessLink = move.newPath;
            this.projects.updateProjects([{
              id: project.id
            }]);
            return;
          }
        }
      })
    })
  }

  /**
   * Subscribe to browser watcher, which communicates with Electron IPC, which in turn listens to browser extensions
   * Once an extension event occurs, create a new Knowledge Source and notify listeners that a new KS is available
   * @private
   */
  private extensionSubscribe() {
    this.extension.links.subscribe((webSource) => {
      console.log('Web source received: ', webSource);
      if (!webSource || !webSource.accessLink) {
        this.notifications.warn('IngestService', 'Empty Link', `Received empty link: ${webSource.accessLink}`);
        return;
      }

      let sanitized = this.sanitizer.sanitize(SecurityContext.URL, webSource.accessLink);
      if (!sanitized) {
        this.notifications.error('IngestService', 'Link Rejected', 'Unable to sanitize URL received from browser extension.');
        return;
      }

      this.factory.make('website', sanitized).then((ks) => {
        ks.importMethod = 'extension';
        ks.title = webSource.title ?? ks.title;
        ks.iconUrl = webSource.iconUrl ?? ks.iconUrl;
        ks.topics = webSource.topics ?? [];
        ks.flagged = webSource.flagged;
        ks.description = webSource.description ?? '';
        ks.rawText = webSource.rawText;

        /* TODO: Move this to ks.markup once it gets implemented after schema changes... */
        if (webSource.markup?.notes && webSource.markup.notes.length > 0) {
          ks.rawText = webSource.markup?.notes[0].body;
        }

        // TODO: need to make sure the factory doesn't do any additional work that was already done by the extensions
        //      i.e. don't try to scrape meta tags if they have already been scraped

        this.enqueue([ks]);
      }).catch((reason) => {
        this.notifications.error('IngestService', 'Exception', 'Unable to sanitize URL received from browser extension.');
      });
    });
  }

  /**
   * Perform any remaining tasks associated with importing `ks` given the desired `operation`
   * @param ks An imported Knowledge Source to be finalized
   * @param operation
   * @private
   */
  private finalize(ks: KnowledgeSource, operation: 'add' | 'remove' | 'delay') {
    // TODO: Files added using file manager should not be checked either (not that checking hurts, but still)...
    if (ks.ingestType !== 'file') {
      return;
    }
    if (this.settings.get().ingest.manager.target !== 'all' && ks.importMethod !== 'autoscan') {
      return;
    }

    let task = this.tasks.find(t => t.id === ks.id.value);
    if (task) {
      this.notifications.debug('IngestService', 'Finalizing', `id: ${ks.id.value}, original import method: ${task.method}, operation: ${operation}`);
      task.callback(operation);
    } else {
      this.notifications.debug('IngestService', 'Task Not Found', `Unable to locate task belonging to id ${ks.id.value}`);
    }
  }
}
