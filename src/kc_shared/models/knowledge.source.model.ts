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
import {WebSourceModel} from "./web.source.model";
import {FileSourceModel} from "./file.source.model";
import {UuidModel} from "./uuid.model";
import {EventModel} from "./event.model";

export interface KnowledgeSourceModel {
    title: string
    id: UuidModel
    type: 'file' | 'web'
    source: FileSourceModel | WebSourceModel
    associatedProjects?: UuidModel[]
    events?: EventModel[]
    icon?: UuidModel
    thumbnail?: UuidModel
    markup?: UuidModel[]
    topics?: UuidModel[]
    authors?: UuidModel[]
    flagged: boolean
}

export interface KnowledgeSource extends KnowledgeSourceModel {

}

export interface KnowledgeSourceImage {
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

export interface KnowledgeSourceIngestTask {
    method: ImportMethod
    callback: (method: 'add' | 'remove' | 'delay') => void
    id: string
}

export type ImportMethod = 'autoscan' | 'dnd' | 'extension' | 'manual';
