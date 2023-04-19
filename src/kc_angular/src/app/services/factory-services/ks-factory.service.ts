/*
 * Copyright (c) 2023 Rob Royce
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
import {ElectronIpcService} from "@services/ipc-services/electron-ipc.service";
import {ExtractorService} from "@services/ingest-services/extractor.service";
import {FaviconService} from "@services/ingest-services/favicon.service";
import {FileSourceModel} from "@shared/models/file.source.model";
import {HttpClient} from "@angular/common/http";
import {IngestType, KnowledgeSource, KnowledgeSourceReference, SourceModel} from "@app/models/knowledge.source.model";
import {Injectable} from '@angular/core';
import {Observable} from "rxjs";
import {SettingsService} from "@services/ipc-services/settings.service";
import {UUID} from "@shared/models/uuid.model";
import {UuidService} from "@services/ipc-services/uuid.service";
import {map} from "rxjs/operators";

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

  constructor(private favicon: FaviconService,
              private extractor: ExtractorService,
              private http: HttpClient,
              private settings: SettingsService,
              private ipc: ElectronIpcService,
              private uuid: UuidService,) {
    this.settings.search.subscribe((searchSettings) => {
      if (searchSettings.provider) {
        this.provider = searchSettings.provider;
      }
    })
  }

  examples(): Observable<{ "title": string, "accessLink": string, "topics": string[] }[]> {
    return this.http
      .get('https://knowledge-app.s3.us-west-1.amazonaws.com/examples_v2.json', {responseType: 'text'})
      .pipe(
        map((ksString) => {
          let examples: { "title": string, "accessLink": string, "topics": string[] }[] = JSON.parse(ksString);
          this.shuffleArray(examples);
          return examples.slice(0, 4);
        })
      )
  }

  make(type: IngestType, link?: URL | string, file?: File): Promise<KnowledgeSource> {
    return new Promise<KnowledgeSource>((resolve, reject) => {
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
          reject(reason)
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
            if (this.settings.get().ingest.manager.target === 'all') {
              // TODO: move file to managed location...
            }
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
      title: "Knowledge Search", id: {value: 'kc-search-ks'},
      reference: {
        ingestType: "website",
        source: {
          file: undefined,
          website: {
            accessLink: "",
            metadata: {
              title: "Knowledge Search",
              icon: ''
            }
          }
        },
        link: ""
      },
      ingestType: "website",
      associatedProject: {value: ''},
      // TODO: remove these to align with new model...
      dateAccessed: [new Date()],
      dateModified: [new Date()],
      dateCreated: new Date(),
      accessLink: accessLink,
      iconUrl: "",
      icon: ''
    };
  }

  private async extractFileResource(link: string, file: File): Promise<KnowledgeSource> {
    const uuid: UUID = this.uuid.generate(1)[0];
    let fileModel: FileSourceModel = {
      id: uuid,
      filename: file.name.trim(),
      path: (file as any).path,
      size: file.size,
      type: file.type,
      creationTime: Date(),
      modificationTime: Date(),
      accessTime: Date()
    }
    let source = new SourceModel(fileModel, undefined);
    let ref = new KnowledgeSourceReference('file', source, link);
    return new KnowledgeSource(file.name.trim(), uuid, 'file', ref);
  }

  private getFileMetadata(ks: KnowledgeSource, file: File): Promise<KnowledgeSource> {
    return new Promise<KnowledgeSource>((resolve) => {
      this.extractor.textFromFile(file).then((results) => {
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
      this.favicon.extractFromKsList([ks]).then((ksList) => {
        resolve(ksList[0])
      }).catch((_: any) => {
        console.warn('Could not extract icon from file KS...');
      });
    });
  }

  private getFileIcons(ksList: KnowledgeSource[]): Promise<KnowledgeSource[]> {
    return new Promise<KnowledgeSource[]>((resolve) => {
      this.favicon.extractFromKsList(ksList).then((results) => {
        resolve(results);
      }).catch((_: any) => {
        console.warn('Could not extract icons from file KS list...');
      });
    });
  }

  private extractWebResource(link: URL): Promise<KnowledgeSource> {
    const uuid: UUID = this.uuid.generate(1)[0];
    let source = new SourceModel(undefined, {accessLink: link.href});
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
      this.extractor.extractWebsiteMetadata(link).then((metadata) => {

        if (metadata.title)
          ks.title = metadata.title.trim();

        if (metadata.meta && metadata.meta.length > 0) {
          const meta = metadata.meta;

          let description = meta.find(m => m.key === 'og:description' || m.key === 'twitter:description' || m.key === 'description');
          if (description) {
            ks.description = description.value ?? description.property ?? '';
          }

          let topics = meta.find(m => m.key === 'keywords' || m.key === 'tags' || m.key === 'topics');
          if (topics) {
            ks.topics = topics.value?.trim().replace(' ', '').split(',') ?? [];
          }
        }

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

      ks.icon = this.favicon.generic();

      this.favicon.extract([ks.iconUrl]).then((icons) => {
        ks.icon = icons[0];
      }).catch((reason) => {
        console.warn('Unable to extract website icon because: ', reason);
      }).finally(() => {
        resolve(ks);
      });
    });
  }

  private shuffleArray(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
}
