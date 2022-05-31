import { KnowledgeSource } from "kc_angular/src/app/models/knowledge.source.model";
import { UuidModel } from "./uuid.model";
import { EventModel } from "./event.model";
export declare type KcProjectType = 'school' | 'work' | 'hobby' | 'default' | 'research';
export interface KcProjectModel {
    readonly id: UuidModel;
    name: string;
    type: KcProjectType;
    description: string;
    events?: EventModel[];
    authors: string[];
    parentId: UuidModel;
    subprojects: string[];
    topics: string[];
    knowledgeSource: KnowledgeSource[];
}
