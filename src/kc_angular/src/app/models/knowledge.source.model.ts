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

import {WebsiteModel} from "./website.model";
import {AuthorModel} from "../../../../kc_shared/models/author.model";
import {FileSourceModel} from "../../../../kc_shared/models/file.source.model";
import {UUID} from "./uuid";



export type IngestType = 'google' | 'file' | 'website' | 'generic' | 'topic' | 'search' | 'note' | 'message';

// TODO: turn this into RDF type (Open graph)
export type SourceType = 'article'

export class SourceModel {
  file: FileSourceModel | undefined;
  website: WebsiteModel | undefined;

  constructor(file?: FileSourceModel, website?: WebsiteModel) {
    if (!file && !website) {
      throw new Error('SourceModel must contain at lesat one valid source.');
    }
    this.file = file;
    this.website = website;
  }
}

export class KnowledgeSourceReference {
  ingestType: IngestType;
  source: SourceModel;
  link: URL | string;

  constructor(ingestType: IngestType, source: SourceModel, link: URL | string) {
    this.ingestType = ingestType;
    this.source = source;
    this.link = link;
  }
}

export type KnowledgeSourceEvent = {
  date: Date,
  label: string,
  hash?: string,
  primeIcon?: string
  imageIcon?: string
  iconText?: string
}

export class KnowledgeSource {
  associatedProject: UUID;
  authors: AuthorModel[];
  dateDue?: Date;
  dateCheckpoint: Date[];
  dateCreated: Date;
  dateAccessed: Date[];
  dateModified: Date[];
  description: string = '';
  events?: KnowledgeSourceEvent[] = [];
  icon?: any;
  iconUrl?: string;
  id: UUID;
  ingestType: IngestType;
  snippet?: string;
  rawText?: string;
  flagged?: boolean;
  title: string;
  topics?: string[];
  note: KnowledgeSourceNote;
  accessLink: URL | string;
  readonly reference: KnowledgeSourceReference;
  importMethod?: 'autoscan' | 'dnd' | 'extension' | 'manual' = 'manual';

  constructor(title: string, id: UUID, ingestType: IngestType, reference: KnowledgeSourceReference) {
    this.title = title;
    this.id = id;
    this.associatedProject = new UUID('');
    this.authors = [];
    this.reference = reference;
    this.ingestType = ingestType;
    this.dateCreated = new Date();
    this.dateCheckpoint = [];
    this.dateModified = [];
    this.dateAccessed = []
    this.accessLink = reference.link;
    this.note = new KnowledgeSourceNote();
    this.flagged = false;
    this.topics = [];
    this.events = [{
      date: new Date(),
      label: 'Created'
    }];
  }
}

export class KnowledgeSourceNote {
  text: string;
  dateCreated: string;
  dateModified: string;
  dateAccessed: string;

  constructor(text?: string) {
    this.text = text ? text : '';
    this.dateCreated = Date();
    this.dateAccessed = Date();
    this.dateModified = Date();
  }

  static blank() {
    return new KnowledgeSourceNote('test');
  }
}

export class KnowledgeSourceMarkup {

}
