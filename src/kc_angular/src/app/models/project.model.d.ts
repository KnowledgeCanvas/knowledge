import { KnowledgeSource } from "./knowledge.source.model";
import { UUID } from "./uuid";
import { KcCalendar } from "./calendar.model";
export declare type ProjectType = 'school' | 'work' | 'hobby' | 'default';
export declare class ProjectModel {
    name: string;
    readonly id: UUID;
    authors?: string[];
    description?: string;
    readonly dateCreated: string;
    readonly dateModified: string;
    readonly parentId?: UUID;
    subprojects?: string[];
    topics?: string[];
    type: ProjectType;
    notes?: string[];
    expanded?: boolean;
    knowledgeSource?: KnowledgeSource[];
    calendar?: KcCalendar;
    constructor(name: string, id: UUID, type?: ProjectType, parentId?: UUID);
}
export interface ProjectCreationRequest {
    name: string;
    parentId?: UUID;
    description?: string;
    knowledgeSource?: KnowledgeSource[];
    authors?: string[];
    topics?: string[];
    type: ProjectType;
    subProjects?: ProjectCreationRequest[];
}
export interface ProjectUpdateRequest {
    id: UUID;
    name?: string;
    description?: string;
    authors?: string[];
    addTopic?: string[];
    removeTopic?: string[];
    updateTopic?: string[];
    overWriteTopics?: string[];
    addKnowledgeSource?: KnowledgeSource[];
    removeKnowledgeSource?: KnowledgeSource[];
    updateKnowledgeSource?: KnowledgeSource[];
}
export interface ProjectEntity {
    readonly id: UUID;
    parentId: UUID;
    name: string;
    description: string;
    lastModified: string;
    readonly creationDate: string;
    subprojects: string[];
}
