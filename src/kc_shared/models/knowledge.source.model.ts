import {Hashable} from "./hashable.model";
import {UuidModel} from "./uuid.model";
import {WebSourceModel} from "./web.source.model";

export interface KnowledgeSourceModel {
    title: string
    id: UuidModel
    type: 'file' | 'web'
    source: File | WebSourceModel
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
    source!: File | WebSourceModel;
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
