import {UUID} from "./uuid";
import {WebsiteModel} from "./website.model";
import {AuthorModel} from "../../../../kc_shared/models/author.model";
import {FileSourceModel} from "../../../../kc_shared/models/file.source.model";


export declare type IngestType = 'google' | 'file' | 'website' | 'generic' | 'topic' | 'search' | 'note';
export declare type SourceReference = 'search' | 'list' | 'extract';
export declare type SourceType = 'article';

export declare class SourceModel {
  file: FileSourceModel | undefined;
  website: WebsiteModel | undefined;

  constructor(file?: FileSourceModel, website?: WebsiteModel);
}

export declare class KnowledgeSourceReference {
  ingestType: IngestType;
  source: SourceModel;
  link: URL | string;

  constructor(ingestType: IngestType, source: SourceModel, link: URL | string);
}

export declare class KnowledgeSource {
  associatedProjects?: UUID[];
  authors?: AuthorModel[];
  dateCreated: Date;
  dateAccessed: Date;
  dateModified: Date;
  description?: string;
  icon?: any;
  id: UUID;
  ingestType: IngestType;
  snippet?: string;
  title: string;
  topics?: string[];
  accessLink: URL | string;
  reference: KnowledgeSourceReference;

  constructor(title: string, id: UUID, ingestType: IngestType, reference: KnowledgeSourceReference);
}

export declare class KnowledgeSourceNotes {
  dateCreated: Date;
  dateModified: Date;
  dateAccessed: Date;
  private content;

  constructor();

  get text(): string;
  set text(content: string);
}
