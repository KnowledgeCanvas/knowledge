import { CytoscapeOptions, LayoutOptions } from "cytoscape";
import { EdgeHandlesOptions } from "cytoscape-edgehandles";
import cxtmenu from "cytoscape-cxtmenu";
export declare class CytoscapeModel {
    cyLayout: LayoutOptions;
    cyOptions: CytoscapeOptions;
    private cx;
    private eh;
    private cy;
    constructor(container: any, options?: CytoscapeOptions);
    setupEdgeHandles(): EdgeHandlesOptions;
    setupContextMenu(): cxtmenu.Options;
    setupNavigator(): void;
    layout(name?: string): void;
    reset(data: any): void;
    private setListeners;
}
