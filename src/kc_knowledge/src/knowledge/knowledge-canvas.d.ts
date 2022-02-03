import { CytoscapeOptions } from "cytoscape";
export declare type KnowledgeSource = any;
export declare class KnowledgeCanvas {
    private cyContainer;
    private ksList?;
    private ksEdges?;
    private cyModel;
    constructor(options?: CytoscapeOptions);
    addKs(ks: KnowledgeSource): void;
    layout(method: string): void;
    private getAllProjects;
    private getCurrentProject;
    private getKnowledgeSources;
}
