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

import {UuidModel} from "./uuid.model";
import {SearchModel} from "./google.search.results.model";
import {FileModel} from "./file.model";
import {WebsiteModel} from "./website.model";
import {AuthorModel} from "./author.model";

export type IngestType = 'google' | 'file' | 'website' | 'generic' | 'topic' | 'search' | 'note';

// TODO: track down all of these and replace them with something more appropriate
// TODO: they originally started as a way to switch the "add to project" and "remove from project" buttons on KS
export type SourceReference = 'search' | 'list' | 'extract';

// TODO: turn this into RDF type (Open graph)
export type SourceType = 'article'

export class SourceModel {
  search: SearchModel | undefined;
  file: FileModel | undefined;
  website: WebsiteModel | undefined;

  constructor(file?: FileModel, search?: SearchModel, website?: WebsiteModel) {
    if (!file && !search && !website) {
      throw new Error('SourceModel must contain at lesat one valid source.');
    }
    this.file = file;
    this.search = search;
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

export class KnowledgeSource {
  associatedProjects?: UuidModel[];
  authors: AuthorModel[] = [];
  dateCreated: Date;
  dateAccessed: Date[];
  dateModified: Date[];
  description: string = '';
  icon?: any;
  iconUrl?: string;
  id: UuidModel;
  ingestType: IngestType;
  snippet?: string;
  sourceRef?: SourceReference;
  rawText?: string;
  title: string;
  topics?: string[];
  note: KnowledgeSourceNote;
  accessLink: URL | string;
  readonly reference: KnowledgeSourceReference;

  constructor(title: string, id: UuidModel, ingestType: IngestType, reference: KnowledgeSourceReference) {
    this.title = title;
    this.id = id;
    this.reference = reference;
    this.ingestType = ingestType;
    this.dateCreated = new Date();
    this.dateModified = [];
    this.dateAccessed = []
    this.accessLink = reference.link;
    this.note = new KnowledgeSourceNote();
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
