import { CytoscapeOptions } from "cytoscape";
export declare type KnowledgeSource = any;
export declare class KnowledgeCanvas {
    private cyContainer;
    private cyModel;
    constructor(options?: CytoscapeOptions);
    layout(method: string): void;
    private getAllProjects;
}
