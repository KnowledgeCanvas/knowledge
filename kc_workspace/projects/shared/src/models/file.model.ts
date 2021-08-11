import {KnowledgeSourceModel} from "./knowledge.source.model";

export interface FileModel extends KnowledgeSourceModel {
  filename?: string,
  size?: number,
  accessTime?: string,
  modificationTime?: string,
  creationTime?: string
}

export interface LocalFileModel extends FileModel {
  mode: string,
  path: string,
  user?: string,
  group?: string,
}

export interface RemoteFileModel extends FileModel {

}
