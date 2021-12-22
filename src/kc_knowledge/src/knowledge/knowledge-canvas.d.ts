import { CytoscapeOptions } from "cytoscape";
import { EdgeHandlesOptions } from "cytoscape-edgehandles";
import cxtmenu from 'cytoscape-cxtmenu';
export declare type KnowledgeSource = any;
export declare class KnowledgeCanvas {
    private SAMPLE_DATA;
    private cy;
    private cx;
    private eh;
    private nav;
    private cyContainer;
    private nodes;
    private edges;
    private ksList;
    private cyLayout;
    private cyOptions;
    constructor(options?: CytoscapeOptions);
    reset(data: any): void;
    addKs(ks: KnowledgeSource): void;
    setupEdgeHandles(): EdgeHandlesOptions;
    setupContextMenu(): cxtmenu.Options;
    setupNavigator(): void;
    layout(name?: string): void;
}
