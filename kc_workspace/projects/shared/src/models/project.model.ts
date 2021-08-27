import {KnowledgeSource} from "./knowledge.source.model";
import {UuidModel} from "./uuid.model";
import {TopicModel} from "./topic.model";

export type ProjectType = 'school' | 'work' | 'hobby' | 'default';

export class ProjectModel {
  name: string = '';
  readonly id: UuidModel = {value: ''};
  authors?: string[] = [];
  description?: string = '';
  readonly dateCreated: string = '';
  readonly dateModified: string = '';
  readonly parentId?: UuidModel = {value: ''};
  subprojects?: string[] = [];
  topics?: string[] = [];
  type: ProjectType;
  expanded?: boolean;
  knowledgeSource?: KnowledgeSource[] = [];

  constructor(name: string, id: UuidModel, type?: ProjectType, parentId?: UuidModel) {
    this.name = name;
    this.id = id;
    this.type = type ? type : 'default';
    this.parentId = parentId;
    this.dateCreated = Date();
    this.dateModified = Date();
  }
}


export interface ProjectCreationRequest {
  name: string;
  parentId?: UuidModel;
  description?: string;
  knowledgeSource?: KnowledgeSource[];
  authors?: string[];
  topics?: string[];
  type: ProjectType;
  subProjects?: ProjectCreationRequest[]
}

export interface ProjectUpdateRequest {
  id: UuidModel;
  name?: string;
  description?: string;
  authors?: string[];
  addTopic?: string[];
  removeTopic?: string[];
  updateTopic?: string[];
  overWriteTopics?: string[];
  addKnowledgeSource?: KnowledgeSource[];
  removeKnowledgeSource?: KnowledgeSource[];
  updateKnowledgeSource?: KnowledgeSource[];
}

export interface ProjectEntity {
  readonly id: UuidModel;
  parentId: UuidModel;
  name: string;
  description: string;
  lastModified: string;
  readonly creationDate: string;
  subprojects: string[];
}
