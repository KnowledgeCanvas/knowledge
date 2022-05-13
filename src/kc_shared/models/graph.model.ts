

export interface ProjectGraphNode {
    name: string
    id: string
    type: string
    expanded: boolean
    subprojects: ProjectGraphNode[]
}

export interface KnowledgeSourceGraphNode {
    name: string
    id: string
    icon: string
}
