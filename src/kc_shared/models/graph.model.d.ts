import { UuidModel } from "./uuid.model";
export interface EventModel {
    timestamp: string;
    id: UuidModel;
    type: 'create' | 'read' | 'update' | 'delete' | 'reminder' | 'checkpoint';
    description?: string;
    icon?: string;
}
export interface ProjectGraphNode {
    name: string;
    id: string;
    type: string;
    expanded: boolean;
    subprojects: ProjectGraphNode[];
}
export interface KnowledgeSourceGraphNode {
    name: string;
    id: string;
    icon: string;
}
