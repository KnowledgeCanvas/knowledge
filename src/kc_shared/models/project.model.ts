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
import {KnowledgeSource} from "kc_angular/src/app/models/knowledge.source.model";
import {UUID, UuidModel} from "./uuid.model";
import {EventModel} from "./event.model";

export type KcProjectType = 'school' | 'work' | 'hobby' | 'default' | 'research';

export interface KcProjectModel {
    readonly id: UUID;
    name: string;
    type: KcProjectType;
    description: string;
    events?: EventModel[];
    authors: string[];
    parentId: UUID;
    subprojects: string[];
    topics: string[];
    knowledgeSource: KnowledgeSource[];
}
