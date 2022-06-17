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
import {Component, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {KnowledgeSource} from "../../../models/knowledge.source.model";
import {KnowledgeSourceFactoryRequest, KsFactoryService} from "../../../services/factory-services/ks-factory.service";
import {NotificationsService} from "../../../services/user-services/notifications.service";
import {ExtractorService} from "../../../services/ingest-services/extractor.service";
import {ElectronIpcService} from "../../../services/ipc-services/electron-ipc.service";
import {IngestService} from "../../../services/ingest-services/ingest.service";
import {UuidService} from "../../../services/ipc-services/uuid.service";
import {FaviconService} from "../../../services/ingest-services/favicon.service";
import {DragAndDropService} from "../../../services/ingest-services/drag-and-drop.service";
import {KsCommandService} from "../../../services/command-services/ks-command.service";
import {ProjectService} from "../../../services/factory-services/project.service";
import {CardOptions} from "../../../../../../kc_shared/models/settings.model";

interface PendingExtraction {
  link: string
  url?: URL
  status?: string
  pctComplete: number
}

@Component({
  selector: 'app-ks-ingest',
  templateUrl: './ks-ingest.component.html',
  styleUrls: ['./ks-ingest.component.scss']
})
export class KsIngestComponent implements OnInit {
  @Output() shouldClose: EventEmitter<boolean> = new EventEmitter<boolean>();

  supportedTypes: string[] = ["Links", "Files"];

  files: File[] = [];

  pending: PendingExtraction[] = [];

  ksList: KnowledgeSource[] = [];

  importToProject: boolean = false;

  constructor(private notifications: NotificationsService,
              private extractor: ExtractorService,
              private uuid: UuidService,
              private dnd: DragAndDropService,
              private favicon: FaviconService,
              private ingest: IngestService,
              private command: KsCommandService,
              private ipc: ElectronIpcService,
              private projects: ProjectService,
              private factory: KsFactoryService) {
    this.supportedTypes = dnd.supportedTypes;
  }

  ngOnInit(): void {
  }

  @HostListener("dragover", ["$event"]) onDragOver(evt: any) {
    evt.preventDefault()
  }

  @HostListener('drop', ['$event']) handleDrop(event: DragEvent) {
    this.dnd.parseDragEvent(event).then((result) => {
      if (result === undefined) {
        console.warn('Drag/Drop could not be handled...');
        return;
      }

      this.factory.many(result).then((ksList) => {
        let pendingLinks: string[] = this.ksList.map(k => typeof k.accessLink === 'string' ? k.accessLink : k.accessLink.href);
        ksList = ksList.filter(ks =>
          typeof ks.accessLink === 'string' && !pendingLinks.includes(ks.accessLink)
          || typeof ks.accessLink !== 'string' && !pendingLinks.includes(ks.accessLink.href));
        this.ksList = [...this.ksList, ...ksList];
      })
    }).catch((reason) => {
      console.error(reason);
    });
  }

  async extract(value: string) {
    // Check for duplicates
    let foundLink = this.pending.find(p => p.link === value);
    let foundKs = this.ksList.find(ks => {
      if (typeof ks.accessLink === 'string') {
        return ks.accessLink.includes(value);
      } else {
        return ks.accessLink.href.includes(value);
      }
    });

    if (foundLink || foundKs) {
      this.notifications.debug('KsIngest', 'Link Already Pending', value);
      return;
    }

    this.pending.push({
      link: value,
      url: new URL(value) ?? new URL(''),
      status: 'Pending',
      pctComplete: 0
    });

    let req: KnowledgeSourceFactoryRequest = {
      ingestType: 'website',
      links: [new URL(value)]
    }
    this.factory.many(req).then((ksList) => {
      if (!ksList || !ksList.length) {
        console.warn('Did not receive ks from list...');
        return;
      }


      let ks = ksList[0];
      this.onSuccess(value, ks);

    }).catch((reason) => {
      console.warn('Unable to create Knowledge Source from ', value, reason);
    });

    // TODO: setup web workers to extract website info asynchronously
    // TODO: make it so these things can be enqueued in Up Next even while they are still loading
  }

  async onSuccess(link: string, ks: KnowledgeSource) {
    let found = this.pending.find(p => p.link === link);
    if (!found || !ks) {
      console.error(`Unable to import link ${link}`);
      return;
    }

    this.pending = this.pending.filter(p => p.link !== link);
    this.ksList.push(ks);
  }


  close() {
    this.shouldClose.emit(true);
  }

  import() {
    if (this.importToProject) {
      const projectId = this.projects.getCurrentProjectId();
      if (!projectId) {
        console.warn(`Unable to import Knowledge Source to apparently invalid project id: ${projectId}`);
        this.ingest.enqueue(this.ksList);
        return;
      }
      this.projects.updateProjects([{
        id: projectId,
        addKnowledgeSource: this.ksList
      }]);
    } else {
      this.ingest.enqueue(this.ksList);
    }

    this.close();
  }


  onAddFile($event: any) {
    const files = $event.currentFiles;
    if (!files) {
      return;
    }

    let req: KnowledgeSourceFactoryRequest = {
      ingestType: 'file',
      files: files
    };

    this.factory.many(req).then((ksList) => {
      if (!ksList || !ksList.length) {
        console.warn('Did not receive ks from list...');
        return;
      }
      this.ksList = [...this.ksList, ...ksList];

    }).catch((reason) => {
      console.warn('Unable to create Knowledge Source from ', files, reason);
    });
  }

  selected($event: any) {
    this.files = $event.currentFiles;
  }

  removed($event: any) {
    this.files = this.files.filter(f => f.name !== $event.file.name && f.size !== $event.file.size);
  }

  onKsRemoved($event: KnowledgeSource) {
    this.ksList = this.ksList.filter(ks => ks.id.value !== $event.id.value);
  }

  onKsOpened(ks: KnowledgeSource) {
    this.command.open(ks);
  }

  onKsPreview(ks: KnowledgeSource) {
    this.command.preview(ks);
  }

  onKsDetail($event: KnowledgeSource) {
    this.command.detail($event);
  }
}
