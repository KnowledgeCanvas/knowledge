import {UuidModel} from "./uuid.model";
import {GoogleSearchItemModel} from "./google.search.results.model";
import {FileModel} from "./file.model";
import {WebsiteModel} from "./website.model";
import {TopicModel} from "./topic.model";
import {AuthorModel} from "./author.model";

export type IngestType = 'google' | 'file' | 'website' | 'generic';

// TODO: track down all of these and replace them with something more appropriate
// TODO: they originally started as a way to switch the "add to project" and "remove from project" buttons on KS
export type SourceReference = 'search' | 'list' | 'extract';

// TODO: turn this into RDF type (Open graph)
export type SourceType = 'article'

export class KnowledgeSourceModel {
  associatedProjects?: UuidModel[];
  authors?: AuthorModel[];
  readonly dateAccessed: string;
  readonly dateCreated: string;
  readonly dateModified: string;
  description?: string;
  fileItem?: FileModel;
  googleItem?: GoogleSearchItemModel;
  icon?: any;
  iconUrl?: string;
  id: UuidModel;
  ingestType: IngestType;
  snippet?: string;
  sourceRef?: SourceReference;
  title: string;
  topics?: string[];
  websiteItem?: WebsiteModel;

  constructor(title: string, id: UuidModel, ingestType: IngestType) {
    this.title = title;
    this.id = id;
    this.ingestType = ingestType;
    this.dateCreated = this.dateModified = this.dateAccessed = Date();
  }
}


