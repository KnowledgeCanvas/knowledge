import {Injectable} from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {KnowledgeSourceReference, KnowledgeSource, SourceModel} from "../../models/knowledge.source.model";
import {ExtractionService} from "../extraction/extraction.service";
import {UuidService} from "../uuid/uuid.service";
import {UuidModel} from "../../models/uuid.model";
import {FaviconExtractorService} from "../favicon/favicon-extractor.service";

@Injectable({
  providedIn: 'root'
})
export class ChromeExtensionService {
  private defaultKS = new KnowledgeSource('', {value: ''}, 'generic', ({} as KnowledgeSourceReference));
  private externalKS = new BehaviorSubject<KnowledgeSource>(this.defaultKS);
  ks = this.externalKS.asObservable();

  constructor(private extractionService: ExtractionService,
              private uuidService: UuidService,
              private faviconService: FaviconExtractorService) {

    window.api.receive('app-chrome-extension-results', (link: string) => {
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

          this.faviconService.extract(url.hostname).then((icon) => {
            ks.icon = icon;
            console.log('Submitting KS from Chrome Extension: ', ks);
            this.externalKS.next(ks);
          });
        }
      });
    });
  }
}
