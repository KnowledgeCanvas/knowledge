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
import {UUID} from "../../../../kc_shared/models/uuid.model";


export class KcProject implements KcProjectModel {
  readonly id: UUID;
  name: string = '';
  authors: string[] = [];
  description: string = '';
  parentId: UUID = {value: ''};
  subprojects: string[] = [];
  topics: string[] = [];
  type: KcProjectType;
  expanded: boolean = false;

  // TODO: this needs to be changed to an array of UUID instead of KS. The KS should be looked up
  sources: UUID[];
  knowledgeSource: KnowledgeSource[] = [];

  // TODO: Should we remove calendar, or events?
  calendar: ProjectCalendar;
  events?: EventModel[] = [];

  // TODO: these should be completely removed and replaced by calendar/events
  readonly dateCreated: Date;
  dateModified: Date;
  dateAccessed: Date;


  constructor(name: string, id: UUID, type?: KcProjectType, parentId?: UUID) {
    this.name = name;
    this.id = id;
    this.type = type ? type : 'default';
    this.parentId = parentId ?? {value: ''};
    this.dateCreated = new Date();
    this.dateModified = new Date();
    this.dateAccessed = new Date();
    this.calendar = {events: [], start: null, end: null};
    this.sources = [];
  }
}


export interface ProjectCreationRequest {
  name: string;
  parentId: UUID;
  description: string;

  // TODO: this needs to be replaced with UUID[]
  knowledgeSource: KnowledgeSource[];
  sources: UUID[];
  authors: string[];
  topics: string[];
  type: KcProjectType;
  subProjects: ProjectCreationRequest[];
  calendar: ProjectCalendar;
}

export type ProjectMoveRequest = { ks: KnowledgeSource, new: UUID };

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
  moveKnowledgeSource?: ProjectMoveRequest
}
