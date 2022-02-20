import {Component, HostListener, OnInit} from '@angular/core';
import {KnowledgeSource, KnowledgeSourceReference, SourceModel} from "../../../models/knowledge.source.model";
import {KnowledgeSourceFactoryRequest, KsFactoryService} from "../../../services/factory-services/ks-factory-service/ks-factory.service";
import {NotificationsService} from "../../../services/user-services/notification-service/notifications.service";
import {ExtractionService} from "../../../services/ingest-services/web-extraction-service/extraction.service";
import {DynamicDialogRef} from "primeng/dynamicdialog";
import {ElectronIpcService} from "../../../services/ipc-services/electron-ipc/electron-ipc.service";
import {KsQueueService} from "../../../services/command-services/ks-queue-service/ks-queue.service";
import {UuidModel} from "../../../models/uuid.model";
import {FileModel} from "../../../models/file.model";
import {UuidService} from "../../../services/ipc-services/uuid-service/uuid.service";
import {FaviconExtractorService} from "../../../services/ingest-services/favicon-extraction-service/favicon-extractor.service";
import {DragAndDropService} from "../../../services/ingest-services/external-drag-and-drop/drag-and-drop.service";
import {KsCommandService} from "../../../services/command-services/ks-command/ks-command.service";

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
  supportedTypes: string[] = ["Links", "Files"];

  files: File[] = [];

  pending: PendingExtraction[] = [];

  ksList: KnowledgeSource[] = [];

  constructor(private notificationService: NotificationsService,
              private extractionService: ExtractionService,
              private uuidService: UuidService,
              private ref: DynamicDialogRef,
              private dragAndDropService: DragAndDropService,
              private faviconService: FaviconExtractorService,
              private upNextService: KsQueueService,
              private ksCommandService: KsCommandService,
              private ipcService: ElectronIpcService,
              private ksFactory: KsFactoryService) {
    this.supportedTypes = dragAndDropService.supportedTypes;
  }

  ngOnInit(): void {
  }

  @HostListener("dragover", ["$event"]) onDragOver(evt: any) {
    evt.preventDefault()
  }

  // Drop listener for importing files and links
  @HostListener('drop', ['$event']) handleDrop(event: DragEvent) {
    this.dragAndDropService.parseDragEvent(event).then((result) => {
      if (result === undefined) {
        console.warn('Drag/Drop could not be handled...');
        return;
      }

      this.ksFactory.many(result).then((ksList) => {
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
      this.notificationService.toast({
        severity: 'info',
        detail: 'Link already being processed...',
        life: 3000,
      })
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
    this.ksFactory.many(req).then((ksList) => {
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
    // TODO: make it so these things can be enqued in Up Next even while they are still loading
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
    this.ref.close();
  }

  import() {
    this.upNextService.enqueue(this.ksList);
    this.ref.close();
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

    this.ksFactory.many(req).then((ksList) => {
      if (!ksList || !ksList.length) {
        console.warn('Did not receive ks from list...');
        return;
      }
      this.ksList = [...this.ksList, ...ksList];

    }).catch((reason) => {
      console.warn('Unable to create Knowledge Source from ', files, reason);
    });
  }


  async submit() {
    let uuids: UuidModel[] = this.uuidService.generate(this.files.length);
    let ksList: KnowledgeSource[] = [];
    let paths: any[] = [];
    let fileText: string[] = [];

    for (let file of this.files) {
      paths.push((file as any).path)
    }

    await this.ipcService.getFileIcon(paths).then((result) => {
      for (let i = 0; i < this.files.length; i++) {
        const file = new FileModel(this.files[i].name, this.files[i].size, (this.files[i] as any).path, uuids[i], this.files[i].type);
        const source = new SourceModel(file, undefined, undefined);
        const link = file.path;
        const ref = new KnowledgeSourceReference('file', source, link);
        let ks = new KnowledgeSource(file.filename, uuids[i], 'file', ref);
        ks.iconUrl = this.faviconService.file();
        ks.icon = result[i];
        if (fileText[i])
          ks.rawText = fileText[i];
        ksList.push(ks);
      }

      this.upNextService.enqueue(ksList);
      this.ref.close();
    });
  }

  selected($event: any) {
    this.files = $event.currentFiles;
  }

  removed($event: any) {
    this.files = this.files.filter(f => f.name !== $event.file.name && f.size !== $event.file.size);
  }


  onDrop($event: DragEvent) {
    console.log('Drop event: ', $event);
  }

  onKsRemoved($event: KnowledgeSource) {
    this.ksList = this.ksList.filter(ks => ks.id.value !== $event.id.value);
  }

  onKsOpened(ks: KnowledgeSource) {
    this.ksCommandService.open(ks);
  }

  onKsPreview(ks: KnowledgeSource) {
    this.ksCommandService.preview(ks);
  }

  onKsDetail($event: KnowledgeSource) {
    this.ksCommandService.detail($event);
  }
}
