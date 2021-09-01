export declare class ProjectTreeNode {
    name: string;
    id: string;
    type: string;
    expanded?: boolean;
    subprojects: ProjectTreeNode[];
    constructor(name?: string, id?: string, type?: string, subprojects?: ProjectTreeNode[]);
    addSubProject(sub: ProjectTreeNode): void;
}
export declare class ProjectTree {
    root: ProjectTreeNode;
    constructor();
    asArray(): ProjectTreeNode[];
    add(node: ProjectTreeNode, parentId?: string): void;
    remove(node: ProjectTreeNode, current: ProjectTreeNode): void;
    find(id: string, node?: ProjectTreeNode): ProjectTreeNode | null;
    private addChild;
}
export interface ProjectTreeFlatNode {
    name: string;
    id: string;
    level: number;
    expandable: boolean;
    expanded?: boolean;
}
