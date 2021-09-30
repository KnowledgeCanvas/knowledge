/**
 Copyright 2021 Rob Royce

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
import {UuidService} from "../uuid/uuid.service";
import {IngestType, KnowledgeSource, KnowledgeSourceReference, SourceModel} from "../../models/knowledge.source.model";
import {ElectronIpcService} from "../electron-ipc/electron-ipc.service";
import {ExtractionService} from "../extraction/extraction.service";
import {FaviconExtractorService} from "../favicon/favicon-extractor.service";
import {UuidModel} from "../../models/uuid.model";
import {SettingsService} from "../settings/settings.service";

@Injectable({
  providedIn: 'root'
})
export class KsFactoryService {
  private provider: string = 'google';

  constructor(private faviconService: FaviconExtractorService,
              private extractionService: ExtractionService,
              private settingsService: SettingsService,
              private ipcService: ElectronIpcService,
              private uuidService: UuidService,) {
    this.settingsService.searchSettings.subscribe((searchSettings) => {
      if (searchSettings.provider) {
        this.provider = searchSettings.provider;
      }
    })
  }

  make(type: IngestType, link: URL | string): Promise<KnowledgeSource> | Promise<undefined> {
    // if (type === 'file') {
    //   if (typeof link === 'string') {
    //     return this.extractFileResource(link);
    //   } else {
    //     return new Promise<undefined>((resolve, reject) => {
    //       reject(undefined)
    //     });
    //   }
    // }

    return this.extractWebResource(typeof link === 'string' ? new URL(link) : link);
  }

  searchKS(searchTerm?: string): KnowledgeSource {
    let ks: KnowledgeSource = {
      authors: [], description: "",
      title: "Knowledge Canvas Search", id: {value: "kc-search-ks"},
      reference: {
        ingestType: "website",
        source: {search: undefined, file: undefined, website: {url: "", metadata: {title: "Knowledge Canvas Search", icon: ''}}},
        link: ""
      },
      ingestType: "website", dateAccessed: new Date(), dateModified: new Date(), dateCreated: new Date(),
      accessLink: "",
      iconUrl: "",
      notes: {text: '', dateAccessed: new Date(), dateCreated: new Date(), dateModified: new Date()},
      icon: ''
    }

    switch (this.provider) {
      case 'google':
        ks.accessLink = searchTerm ? `https://www.google.com/search?q=${encodeURIComponent(searchTerm)}` : `https://www.google.com/`;
        break;
      case 'bing':
        ks.accessLink = searchTerm ? `https://www.bing.com/search?q=${encodeURIComponent(searchTerm)}` : `https://www.bing.com/`;
        break;
      case 'duck':
        ks.accessLink = searchTerm ? `https://duckduckgo.com/?q=${encodeURIComponent(searchTerm)}` : `https://duckduckgo.com/`;
        break;
      default:
        ks.accessLink = searchTerm ? `https://www.google.com/search?q=${encodeURIComponent(searchTerm)}` : `https://www.google.com/`;
    }

    return ks;
  }

  private extractWebResource(link: URL): Promise<KnowledgeSource> {
    const uuid: UuidModel = this.uuidService.generate(1)[0];
    let source = new SourceModel(undefined, undefined, {url: link.href});
    let ref = new KnowledgeSourceReference('website', source, link);
    let ks = new KnowledgeSource('', uuid, 'website', ref);
    return this.getWebsiteMetadata(ks)
      .then((metaKs) => {
        return this.getWebsiteIcon(metaKs);
      });
  }

  private getWebsiteMetadata(ks: KnowledgeSource): Promise<KnowledgeSource> {
    return new Promise<KnowledgeSource>((resolve) => {
      const link = typeof ks.accessLink === 'string' ? ks.accessLink : ks.accessLink.href
      this.extractionService.extractWebsiteMetadata(link).then((metadata) => {
        if (metadata.title)
          ks.title = metadata.title;
        if (ks.reference.source.website)
          ks.reference.source.website.metadata = metadata;
      }).catch((reason) => {
        console.warn('Unable to extract website metadata because: ', reason);
      }).finally(() => {
        resolve(ks);
      });
    });
  }

  private getWebsiteIcon(ks: KnowledgeSource): Promise<KnowledgeSource> {
    return new Promise<KnowledgeSource>((resolve) => {
      ks.iconUrl = typeof ks.accessLink === 'string' ? ks.accessLink : ks.accessLink.hostname;
      ks.icon = this.faviconService.generic();

      this.faviconService.extract([ks.iconUrl]).then((icons) => {
        ks.icon = icons[0];
      }).catch((reason) => {
        console.warn('Unable to extract website icon because: ', reason);
      }).finally(() => {
        resolve(ks);
      });
    });
  }

  // private extractFileResource(path: string): Promise<KnowledgeSource> {
  //
  // }
}
