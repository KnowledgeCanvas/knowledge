import { KnowledgeSource } from "./knowledge.source.model";
import { UuidModel } from "./uuid.model";
import { KcCalendar } from "./calendar.model";
export declare type ProjectType = 'school' | 'work' | 'hobby' | 'default';
export declare class ProjectModel {
    name: string;
    readonly id: UuidModel;
    authors?: string[];
    description?: string;
    readonly dateCreated: string;
    readonly dateModified: string;
    readonly parentId?: UuidModel;
    subprojects?: string[];
    topics?: string[];
    type: ProjectType;
    notes?: string[];
    expanded?: boolean;
    knowledgeSource?: KnowledgeSource[];
    calendar?: KcCalendar;
    constructor(name: string, id: UuidModel, type?: ProjectType, parentId?: UuidModel);
}
export interface ProjectCreationRequest {
    name: string;
    parentId?: UuidModel;
    description?: string;
    knowledgeSource?: KnowledgeSource[];
    authors?: string[];
    topics?: string[];
    type: ProjectType;
    subProjects?: ProjectCreationRequest[];
}
export interface ProjectUpdateRequest {
    id: UuidModel;
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
    readonly id: UuidModel;
    parentId: UuidModel;
    name: string;
    description: string;
    lastModified: string;
    readonly creationDate: string;
    subprojects: string[];
}
