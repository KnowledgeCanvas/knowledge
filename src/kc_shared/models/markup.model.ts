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
import {EventModel} from "./event.model";
import {UuidModel} from "./uuid.model";

export interface KnowledgeSourceMarkup {
    id: UuidModel
    pos: { x: Number, y: Number, width: Number, height: Number }
    events?: EventModel
}

export interface MarkupColor {
    color: string
}

export interface MarkupFont {
    weight: number
}

export interface MarkupData {
    data: string
}

export interface MarkupNote extends KnowledgeSourceMarkup {
    title: string
    body: string
}

export interface MarkupSticker extends KnowledgeSourceMarkup, MarkupData {
    link?: string
}

export interface MarkupUnderline extends KnowledgeSourceMarkup, MarkupColor, MarkupFont, Partial<MarkupData> {}

export interface MarkupHighlight extends KnowledgeSourceMarkup, MarkupColor, MarkupFont, Partial<MarkupData> {
    opacity: number
}
