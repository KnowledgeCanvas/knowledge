import {KnowledgeSource, KnowledgeSourceNotes} from "./knowledge.source.model";
import {UuidModel} from "./uuid.model";
import {KcCalendar} from "./calendar.model";

export type ProjectType = 'school' | 'work' | 'hobby' | 'default';

export class ProjectModel {
  name: string = '';
  readonly id: UuidModel = {value: ''};
  authors?: string[] = [];
  description?: string = '';
  readonly dateCreated: string = '';
  dateModified: string = '';
  dateAccessed: string = '';
  readonly parentId?: UuidModel = {value: ''};
  subprojects?: string[] = [];
  topics?: string[] = [];
  type: ProjectType;
  notes?: string[];
  expanded?: boolean;
  knowledgeSource?: KnowledgeSource[] = [];
  calendar: KcCalendar;

  constructor(name: string, id: UuidModel, type?: ProjectType, parentId?: UuidModel) {
    this.name = name;
    this.id = id;
    this.type = type ? type : 'default';
    this.parentId = parentId;
    this.dateCreated = Date();
    this.dateModified = Date();
    this.dateAccessed = Date();
    this.calendar = new KcCalendar();
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
  subProjects?: ProjectCreationRequest[];
  calendar?: KcCalendar;
}

export interface ProjectUpdateRequest {
  id: UuidModel;
  name?: string;
  description?: string;
  notes?: string;
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
