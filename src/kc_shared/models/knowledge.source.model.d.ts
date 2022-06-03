import { Hashable } from "./hashable.model";
import { WebSourceModel } from "./web.source.model";
import { FileSourceModel } from "./file.source.model";
import { UuidModel } from "./uuid.model";
export interface KnowledgeSourceModel {
    title: string;
    id: UuidModel;
    type: 'file' | 'web';
    source: FileSourceModel | WebSourceModel;
    associatedProjects?: UuidModel[];
    events?: UuidModel[];
    icon?: UuidModel;
    thumbnail?: UuidModel;
    markup?: UuidModel[];
    topics?: UuidModel[];
    authors?: UuidModel[];
}
export declare class KnowledgeSource implements KnowledgeSourceModel {
    id: UuidModel;
    source: FileSourceModel | WebSourceModel;
    title: string;
    type: 'file' | 'web';
}
export interface KnowledgeSourceImage extends Hashable {
    id: UuidModel;
    data: string;
}
export interface KnowledgeSourceIcon extends KnowledgeSourceImage {
    link?: string;
}
export interface KnowledgeSourceThumbnail extends KnowledgeSourceImage {
    height: number;
    width: number;
    link?: string;
}
export interface KnowledgeSourceIngestTask {
    method: 'manual' | 'extension' | 'autoscan' | 'dnd';
    callback: (method: 'add' | 'remove' | 'delay') => void;
    id: string;
}
