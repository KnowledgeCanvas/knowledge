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
import {Hashable} from "./hashable.model";
import {WebSourceModel} from "./web.source.model";
import {FileSourceModel} from "./file.source.model";
import {UuidModel} from "./uuid.model";

export interface KnowledgeSourceModel {
    title: string
    id: UuidModel
    type: 'file' | 'web'
    source: FileSourceModel | WebSourceModel
    associatedProjects?: UuidModel[]
    events?: UuidModel[]
    icon?: UuidModel
    thumbnail?: UuidModel
    markup?: UuidModel[]
    topics?: UuidModel[]
    authors?: UuidModel[]
}

export class KnowledgeSource implements KnowledgeSourceModel{
    id!: UuidModel;
    source!: FileSourceModel | WebSourceModel;
    title!: string;
    type!: 'file' | 'web';
}

export interface KnowledgeSourceImage extends Hashable {
    id: UuidModel
    data: string
}

export interface KnowledgeSourceIcon extends KnowledgeSourceImage {
    link?: string
}

export interface KnowledgeSourceThumbnail extends KnowledgeSourceImage {
    height: number
    width: number
    link?: string
}
