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
import {UuidService} from "../../ipc-services/uuid-service/uuid.service";
import {IngestType, KnowledgeSource, KnowledgeSourceNote, KnowledgeSourceReference, SourceModel} from "../../../models/knowledge.source.model";
import {ElectronIpcService} from "../../ipc-services/electron-ipc/electron-ipc.service";
import {ExtractionService} from "../../ingest-services/web-extraction-service/extraction.service";
import {FaviconExtractorService} from "../../ingest-services/favicon-extraction-service/favicon-extractor.service";
import {SettingsService} from "../../ipc-services/settings-service/settings.service";
import {FileSourceModel} from "../../../../../../kc_shared/models/file.source.model";
import {UUID} from "../../../models/uuid";

export interface KnowledgeSourceFactoryRequest {
  ingestType: IngestType,
  links?: (URL | string)[],
  files?: File[]
}

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
    this.settingsService.search.subscribe((searchSettings) => {
      if (searchSettings.provider) {
        this.provider = searchSettings.provider;
      }
    })
  }

  make(type: IngestType, link?: URL | string, file?: File): Promise<KnowledgeSource> {
    return new Promise<KnowledgeSource>((resolve) => {
      if (type === 'file' && file) {
        if (typeof link === 'string') {
          this.extractFileResource(link, file)
            .then(this.getFileIcon)
            .then((result) => {
              resolve(result);
            });
        }
      }

      if (link) {
        this.extractWebResource(typeof link === 'string' ? new URL(link) : link)
          .then((result) => {
            resolve(result);
          }).catch((reason) => {
          console.warn('Could not create KS from link because: ', reason);
        });
      }
    });
  }

  many(requests: KnowledgeSourceFactoryRequest): Promise<KnowledgeSource[]> {
    return new Promise<KnowledgeSource[]>((resolve) => {
      let actions: Promise<KnowledgeSource>[] = [];
      if (requests.ingestType === 'file' && requests.files?.length) {
        for (let file of requests.files) {
          actions.push(this.extractFileResource((file as any).path, file));
        }
        Promise.all(actions).then((results) => {
          this.getFileIcons(results).then((finalList) => {
            resolve(finalList);
          })
        })
      }
      if (requests.ingestType !== 'file' && requests.links?.length) {
        for (let link of requests.links) {
          actions.push(this.extractWebResource(new URL(link)));
        }
        Promise.all(actions).then((results) => {
          resolve(results);
        });
      }
    });
  }

  searchKS(searchTerm?: string): KnowledgeSource {
    let accessLink: string;
    switch (this.provider) {
      case 'google':
        accessLink = searchTerm ? `https://www.google.com/search?q=${encodeURIComponent(searchTerm)}` : `https://www.google.com/`;
        break;
      case 'bing':
        accessLink = searchTerm ? `https://www.bing.com/search?q=${encodeURIComponent(searchTerm)}` : `https://www.bing.com/`;
        break;
      case 'duck':
        accessLink = searchTerm ? `https://duckduckgo.com/?q=${encodeURIComponent(searchTerm)}` : `https://duckduckgo.com/`;
        break;
      default:
        accessLink = searchTerm ? `https://www.google.com/search?q=${encodeURIComponent(searchTerm)}` : `https://www.google.com/`;
    }

    return {
      authors: [], description: "",
      title: "Knowledge Canvas Search", id: new UUID('kc-search-ks'),
      reference: {
        ingestType: "website",
        source: {
          file: undefined,
          website: {
            url: "",
            metadata: {
              title: "Knowledge Canvas Search",
              icon: ''
            }
          }
        },
        link: ""
      },
      ingestType: "website",
      associatedProject: new UUID(''),
      dateCheckpoint: [],
      dateAccessed: [new Date()],
      dateModified: [new Date()],
      dateCreated: new Date(),
      accessLink: accessLink,
      iconUrl: "",
      note: new KnowledgeSourceNote(),
      icon: ''
    };
  }

  private async extractFileResource(link: string, file: File): Promise<KnowledgeSource> {
    const uuid: UUID = this.uuidService.generate(1)[0];
    let fileModel: FileSourceModel = {
      id: uuid,
      filename: file.name,
      path: (file as any).path,
      size: file.size,
      type: file.type,
      creationTime: Date(),
      modificationTime: Date(),
      accessTime: Date()
    }
    let source = new SourceModel(fileModel, undefined);
    let ref = new KnowledgeSourceReference('file', source, link);
    return new KnowledgeSource(file.name, uuid, 'file', ref);
  }

  private getFileMetadata(ks: KnowledgeSource, file: File): Promise<KnowledgeSource> {
    return new Promise<KnowledgeSource>((resolve) => {
      this.extractionService.textFromFile(file).then((results) => {
        ks.rawText = results;
      }).catch((reason) => {
        console.warn('Could not extract text from file: ', reason);
      }).finally(() => {
        resolve(ks);
      });
    });
  }

  private getFileIcon(ks: KnowledgeSource): Promise<KnowledgeSource> {
    return new Promise<KnowledgeSource>((resolve) => {
      this.faviconService.extractFromKsList([ks]).then((ksList) => {
        resolve(ksList[0])
      }).catch((_: any) => {
        console.warn('Could not extract icon from file KS...');
      });
    });
  }

  private getFileIcons(ksList: KnowledgeSource[]): Promise<KnowledgeSource[]> {
    return new Promise<KnowledgeSource[]>((resolve) => {
      this.faviconService.extractFromKsList(ksList).then((results) => {
        resolve(results);
      }).catch((_: any) => {
        console.warn('Could not extract icons from file KS list...');
      });
    });
  }

  private extractWebResource(link: URL): Promise<KnowledgeSource> {
    const uuid: UUID = this.uuidService.generate(1)[0];
    let source = new SourceModel(undefined, {url: link.href});
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
      if (ks.icon) {
        resolve(ks);
      }

      if (typeof ks.accessLink === 'string') {
        ks.iconUrl = ks.accessLink;
      } else {
        if (ks.accessLink.hostname.includes(ks.accessLink.protocol)) {
          ks.iconUrl = ks.accessLink.hostname;
        } else {
          ks.iconUrl = ks.accessLink.origin;
        }
      }

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
}
