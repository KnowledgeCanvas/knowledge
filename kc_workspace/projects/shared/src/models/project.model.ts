import {KnowledgeSourceModel} from "./knowledge.source.model";

export interface ProjectModel {
  name?: string;
  id?: string;
  authors?: string[];
  description?: string;
  creationDate?: string;
  lastModified?: string;
  parentId?: string;
  subprojects?: string[];
  topics?: string[];
  type?: 'school' | 'work' | 'hobby' | 'default';
  knowledgeSource?: KnowledgeSourceModel[];
}


export interface ProjectCreationRequest {
  name: string;
  parentId?: string;
  description?: string;
  authors?: string[];
  topics?: string[];
  type?: 'school' | 'work' | 'hobby' | 'default';
}

export interface ProjectUpdateRequest {
  id: string;
  name?: string;
  description?: string;
  authors?: string[];
  topics?: string[];
  knowledgeSource?: KnowledgeSourceModel[];
}

export interface ProjectEntity {
  readonly id: string;
  parentId: string;
  name: string;
  description: string;
  lastModified: string;
  readonly creationDate: string;
  subprojects: string[];
}
