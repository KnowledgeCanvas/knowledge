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
import {KcProjectModel, KcProjectType} from "../../../../kc_shared/models/project.model";
import {EventModel, ProjectCalendar} from "../../../../kc_shared/models/event.model";
import {UUID} from "./uuid";


export class KcProject implements KcProjectModel {
  name: string = '';
  readonly id: UUID;
  events?: EventModel[] = [];
  authors: string[] = [];
  description: string = '';
  readonly dateCreated: Date;
  dateModified: Date;
  dateAccessed: Date;
  parentId: UUID = new UUID('');
  subprojects: string[] = [];
  topics: string[] = [];
  type: KcProjectType;
  expanded: boolean = false;
  knowledgeSource: KnowledgeSource[] = [];
  calendar: ProjectCalendar;


  constructor(name: string, id: UUID, type?: KcProjectType, parentId?: UUID) {
    this.name = name;
    this.id = id;
    this.type = type ? type : 'default';
    this.parentId = parentId ?? new UUID('');
    this.dateCreated = new Date();
    this.dateModified = new Date();
    this.dateAccessed = new Date();
    this.calendar = {events: [], start: null, end: null};
  }
}


export interface ProjectCreationRequest {
  name: string;
  parentId: UUID;
  description: string;
  knowledgeSource: KnowledgeSource[];
  authors: string[];
  topics: string[];
  type: KcProjectType;
  subProjects: ProjectCreationRequest[];
  calendar: ProjectCalendar;
}

export interface ProjectUpdateRequest {
  id: UUID;
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
  moveKnowledgeSource?: { ks: KnowledgeSource, new: UUID }
}
