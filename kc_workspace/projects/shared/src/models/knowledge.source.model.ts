import {UuidModel} from "./uuid.model";
import {GoogleSearchItemModel} from "./google.search.results.model";
import {LocalFileModel, RemoteFileModel} from "./file.model";

export interface KnowledgeSourceModel {
  title: string,
  id?: UuidModel
  url?: string,
  iconUrl?: string,
  icon?: any,
  description?: string,
  googleItem?: GoogleSearchItemModel,
  fileItem?: RemoteFileModel | LocalFileModel,
  ingestType: 'google' | 'file' | 'website',
  sourceRef?: 'search' | 'list'
}
