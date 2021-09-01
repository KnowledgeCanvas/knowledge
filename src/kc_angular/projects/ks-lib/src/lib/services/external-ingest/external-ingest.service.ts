import {Injectable} from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {
  KnowledgeSource,
  KnowledgeSourceReference,
  SourceModel
} from "projects/ks-lib/src/lib/models/knowledge.source.model";
import {ExtractionService} from "../extraction/extraction.service";
import {UuidService} from "../uuid/uuid.service";
import {UuidModel} from "projects/ks-lib/src/lib/models/uuid.model";
import {FaviconExtractorService} from "../favicon/favicon-extractor.service";
import {ElectronIpcService} from "../electron-ipc/electron-ipc.service";

@Injectable({
  providedIn: 'root'
})
export class ExternalIngestService {
  private defaultKS = new KnowledgeSource('', {value: ''}, 'generic', ({} as KnowledgeSourceReference));
  private externalKS = new BehaviorSubject<KnowledgeSource[]>([]);
  ks = this.externalKS.asObservable();
  private receive = window.api.receive;
  private send = window.api.send;

  constructor(private faviconService: FaviconExtractorService,
              private extractionService: ExtractionService,
              private ipcService: ElectronIpcService,
              private uuidService: UuidService) {

    this.receive('app-chrome-extension-results', (link: string) => {
      this.extractionService.extractWebsiteMetadata(link).then((metadata) => {
        if (metadata.title) {
          const uuid: UuidModel = this.uuidService.generate(1)[0];

          let sourceLink = new URL(link);
          let source = new SourceModel(undefined, undefined, {url: link, metadata: metadata});
          let ref = new KnowledgeSourceReference('website', source, sourceLink);
          let ks = new KnowledgeSource(metadata.title, uuid, 'website', ref);

          let url = new URL(link);
          ks.iconUrl = url.hostname;
          ks.icon = this.faviconService.generic();

          this.faviconService.extract([url.hostname]).then((icons) => {
            ks.icon = icons[0];
            this.externalKS.next([ks]);
          });
        }
      });
    });

    this.ipcService.ingestWatcher().subscribe((fileModels) => {
      let iconRequests = [];
      let ksList: KnowledgeSource[] = [];

      for (let fileModel of fileModels) {
        iconRequests.push(fileModel.path);
      }

      this.ipcService.getFileIcon(iconRequests).then((icons) => {
        console.log('Got file icons: ', icons);

        for (let i = 0; i < fileModels.length; i++) {
          let fileModel = fileModels[i];

          console.log('Received file from IPC: ', fileModel);

          let sourceLink = fileModel.path;
          let source = new SourceModel(fileModel, undefined, undefined);
          let ref = new KnowledgeSourceReference('file', source, sourceLink);
          let ks = new KnowledgeSource(fileModel.filename, fileModel.id, 'file', ref);
          ks.dateAccessed = new Date(fileModel.accessTime);
          ks.dateModified = new Date(fileModel.modificationTime);
          ks.dateCreated = new Date(fileModel.creationTime);
          ks.iconUrl = this.faviconService.file();
          ks.icon = icons[i];
          ksList.push(ks);

          console.log('Created new KS from ingest watcher: ', ks);
        }
        this.externalKS.next(ksList);
      });
    });
  }
}
