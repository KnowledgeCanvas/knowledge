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

import {KnowledgeSource} from "./knowledge.source.model";
import {UuidModel} from "./uuid.model";
import {KcCalendar} from "./calendar.model";

export type ProjectType = 'school' | 'work' | 'hobby' | 'default';

export class ProjectModel {
  name: string = '';
  readonly id: UuidModel;
  authors: string[] = [];
  description: string = '';
  readonly dateCreated: Date;
  dateModified: Date;
  dateAccessed: Date;
  parentId: UuidModel = new UuidModel('');
  subprojects: string[] = [];
  topics: string[] = [];
  type: ProjectType;
  notes: string[] = [];
  expanded: boolean = false;
  knowledgeSource: KnowledgeSource[] = [];
  calendar: KcCalendar;

  constructor(name: string, id: UuidModel, type?: ProjectType, parentId?: UuidModel) {
    this.name = name;
    this.id = id;
    this.type = type ? type : 'default';
    this.parentId = parentId ?? new UuidModel('');
    this.dateCreated = new Date();
    this.dateModified = new Date();
    this.dateAccessed = new Date();
    this.calendar = {events: [], start: null, end: null};
  }
}


export interface ProjectCreationRequest {
  name: string;
  parentId: UuidModel;
  description: string;
  knowledgeSource: KnowledgeSource[];
  authors: string[];
  topics: string[];
  type: ProjectType;
  subProjects: ProjectCreationRequest[];
  calendar: KcCalendar;
}

export interface ProjectUpdateRequest {
  id: UuidModel;
  name?: string;
  description?: string;
  notes?: string;
  expanded?: boolean;
  parentId?: string;
  addSubprojects?: string[];
  removeSubprojects?: string[];
  authors?: string[];
  addTopic?: string[];
  removeTopic?: string[];
  updateTopic?: string[];
  overWriteTopics?: string[];
  addKnowledgeSource?: KnowledgeSource[];
  removeKnowledgeSource?: KnowledgeSource[];
  updateKnowledgeSource?: KnowledgeSource[];
  moveKnowledgeSource?: { ks: KnowledgeSource, new: UuidModel }
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
