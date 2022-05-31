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

import {Injectable, SecurityContext} from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {KnowledgeSource, KnowledgeSourceReference, SourceModel} from "src/app/models/knowledge.source.model";
import {ExtractionService} from "../web-extraction-service/extraction.service";
import {UuidService} from "../../ipc-services/uuid-service/uuid.service";
import {FaviconExtractorService} from "../favicon-extraction-service/favicon-extractor.service";
import {ElectronIpcService} from "../../ipc-services/electron-ipc/electron-ipc.service";
import {DomSanitizer} from "@angular/platform-browser";
import {KsFactoryService} from "../../factory-services/ks-factory-service/ks-factory.service";
import {FileWatcherIpcService} from "../../ipc-services/filewatcher-ipc-service/file-watcher-ipc.service";
import {NotificationsService} from "../../user-services/notification-service/notifications.service";

@Injectable({
  providedIn: 'root'
})
export class ExternalIngestService {
  private externalKS = new BehaviorSubject<KnowledgeSource[]>([]);
  ks = this.externalKS.asObservable();

  constructor(private faviconService: FaviconExtractorService,
              private extractionService: ExtractionService,
              private ipcService: ElectronIpcService,
              private fileWatcher: FileWatcherIpcService,
              private ksFactory: KsFactoryService,
              private uuidService: UuidService,
              private notifications: NotificationsService,
              private sanitizer: DomSanitizer) {
    /**
     * Subscribe to browser watcher, which communicates with Electron IPC, which in turn listens to browser kc_extensions
     * Once an extension event occurs, create a new Knowledge Source and notify listeners that a new KS is available
     */
    this.ipcService.browserWatcher().subscribe((link) => {
      let sanitized = this.sanitizer.sanitize(SecurityContext.URL, link);
      if (!sanitized) {
        this.notifications.error('ExternalIngestService', 'Link Rejected', 'Unable to sanitize URL received from browser extension.');
        return;
      }

      this.ksFactory.make('website', sanitized).then((ks) => {
        ks.importMethod = 'extension';
        this.externalKS.next([ks]);
      }).catch((reason) => {
        this.notifications.error('ExternalIngestService', 'Exception', 'Unable to sanitize URL received from browser extension.');
      });
    });

    /**
     * Subscribe to file watcher, which communicates with Electron IPC, which in turn watches a local directory for files
     * Once an extension event occurs, create a new Knowledge Source and notify listeners that a new KS is available
     *
     * TODO: Ideally, this function should use ksFactory to create KS
     */
    this.fileWatcher.files.subscribe((fileModels) => {
      let iconRequests = [];
      let ksList: KnowledgeSource[] = [];

      for (let fileModel of fileModels) {
        iconRequests.push(fileModel.path);
      }

      this.ipcService.getFileIcon(iconRequests).then((icons) => {
        for (let i = 0; i < fileModels.length; i++) {
          let fileModel = fileModels[i];
          let sourceLink = fileModel.path;
          let source = new SourceModel(fileModel, undefined);
          let ref = new KnowledgeSourceReference('file', source, sourceLink);
          let ks = new KnowledgeSource(fileModel.filename, fileModel.id, 'file', ref);
          ks.dateAccessed = [];
          ks.dateModified = [];
          ks.dateCreated = new Date();
          ks.iconUrl = this.faviconService.file();
          ks.icon = icons[i];
          ks.importMethod = 'autoscan';
          ksList.push(ks);
        }

        this.externalKS.next(ksList);
      });
    });
  }
}
