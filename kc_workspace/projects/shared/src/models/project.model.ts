import {ProjectTreeNode} from "./project.tree.model";
import {KnowledgeSourceModel} from "./knowledge.source.model";

export interface ProjectModel {
    name?: string;
    id?: string;
    authors?: string[];
    description?: string;
    creationDate?: string;
    lastModified?: string;
    parentId?: string;
    subprojects?: string[];
    tags?: string[];
    knowledgeSource?: KnowledgeSourceModel[];
}


export interface ProjectCreationRequest {
    name: string;
    parentId?: string;
    description?: string;
    authors?: string[];
    tags?: string[];
}

export interface ProjectUpdateRequest {
    id: string;
    name?: string;
    description?: string;
    authors?: string[];
    tags?: string[];
    knowledgeSource?: KnowledgeSourceModel[];
}

export interface ProjectEntity {
    readonly id: string;
    parentId: string;
    name: string;
    description: string;
    lastModified: string;
    readonly creationDate: string;
    subprojects: string[];
}
