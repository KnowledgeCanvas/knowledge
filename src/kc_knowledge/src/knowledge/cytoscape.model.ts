import cytoscape, {CytoscapeOptions, LayoutOptions, SingularData} from "cytoscape";
import {EdgeHandlesInstance, EdgeHandlesOptions} from "cytoscape-edgehandles";
import cxtmenu from "cytoscape-cxtmenu";
import dagre from "cytoscape-dagre";

cytoscape.use(cxtmenu);
cytoscape.use(dagre);


export class CytoscapeModel {
    public cyLayout: LayoutOptions = {
        name: "dagre",

        // whether to fit to viewport
        fit: true,

        // fit padding
        padding: 100,

        // Applies a multiplicative factor (>0) to expand or compress the overall area that the nodes take up
        spacingFactor: 1,

        // Applies a multiplicative factor (>0) to expand or compress the overall area that the nodes take up
        nodeDimensionsIncludeLabels: true,

        // whether to transition the node positions
        animate: true,

        // whether to animate specific nodes when animation is on; non-animated nodes immediately go to their final positions
        animateFilter: (node, i) => {
            return true;
        },

        // duration of animation in ms if enabled
        animationDuration: 500,

        // easing of animation if enabled
        animationEasing: undefined,

        // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
        boundingBox: undefined,

        // a function that applies a transform to the final node position
        transform: function (node, pos) {
            return pos;
        },

        // on layoutready
        ready: function () {
        },

        // on layoutstop
        stop: function () {
        }
    };
    public cyOptions: CytoscapeOptions = {
        container: null,
        layout: this.cyLayout,
        style: [{
            selector: 'edge',
            style: {'line-color': 'black', 'width': 1}
        }, {
            selector: 'node',
            style: {
                'content': 'data(label)',
                'text-valign': 'bottom',
                'text-halign': 'center',
                "text-wrap": "wrap",
                "text-max-width": '100px',
            }
        }, {
            selector: 'node[type="project"]',
            style: {
                'width': '48px',
                'height': '48px',
                'background-color': '#64758B'
            }
        }, {
            selector: 'node[type="ks"]',
            style: {
                "background-color": '#FFFFFF',
                'width': '32px',
                'height': '32px',
            }
        },
            {
            selector: '.eh-handle',
            style: {
                'background-color': 'red',
                'width': 12,
                'height': 12,
                'shape': 'ellipse',
                'overlay-opacity': 0,
                'border-width': 12, // makes the handle easier to hit
                'border-opacity': 0
            }
        }, {
            selector: '.eh-hover',
            style: {'background-color': 'red'}
        }, {
            selector: '.eh-source',
            style: {
                'border-width': 2,
                'border-color': 'red'
            }
        }, {
            selector: '.eh-target',
            style: {
                'border-width': 2,
                'border-color': 'red'
            }
        }, {
            selector: '.eh-preview, .eh-ghost-edge',
            style: {
                'background-color': 'red',
                'line-color': 'red',
                'target-arrow-color': 'red',
                'source-arrow-color': 'red'
            }
        }, {
            selector: '.eh-ghost-edge.eh-preview-active',
            style: {'opacity': 0}
        }]
    }
    private cx: cxtmenu.MenuInstance;
    private eh: EdgeHandlesInstance;
    private cy: cytoscape.Core;

    constructor(container: any, options?: CytoscapeOptions) {
        this.cyOptions.container = container;
        this.cyOptions = options ? options : this.cyOptions;
        this.cy = cytoscape(this.cyOptions);

        // Instantiate Edge Handler
        let handles = this.setupEdgeHandles();
        this.eh = this.cy.edgehandles(handles);

        let context = this.setupContextMenu();
        this.cx = this.cy.cxtmenu(context);

        this.setListeners();

        this.cy?.layout({
            name: 'grid'
        }).run();
    }

    setupEdgeHandles(): EdgeHandlesOptions {
        // Configure Edge Handler
        return {

            // whether an edge can be created between source and target
            canConnect: (sourceNode, targetNode) => {
                return !sourceNode.same(targetNode);
            },

            edgeParams: function (sourceNode, targetNode) {
                // for edges between the specified source and target
                // return element object to be passed to cy.add() for edge
                return {
                    data: {}
                };
            },
            hoverDelay: 150, // time spent hovering over a target node before it is considered selected
            snap: true, // when enabled, the edge can be drawn by just moving close to a target node (can be confusing on compound graphs)
            snapThreshold: 50, // the target node must be less than or equal to this many pixels away from the cursor/finger
            snapFrequency: 15, // the number of times per second (Hz) that snap checks done (lower is less expensive)
            noEdgeEventsInDraw: true, // set events:no to edges during draws, prevents mouseouts on compounds
            disableBrowserGestures: true // during an edge drawing gesture, disable browser gestures such as two-finger trackpad swipe and pinch-to-zoom
        };
    }

    setupContextMenu(): cxtmenu.Options {
        return {
            menuRadius: function (ele: SingularData) {
                return 80;
            },
            selector: 'node',
            commands: [
                {
                    fillColor: 'rgba(200, 200, 200, 0.75)', // optional: custom background color for item
                    content: 'View Text', // html/text content to be displayed in the menu
                    contentStyle: {}, // css key:value pairs to set the command's css in js if you want
                    select: function (ele: SingularData) { // a function to execute when the command is selected
                        console.log(ele.id()) // `ele` holds the reference to the active element
                    },
                    enabled: true
                },
                {
                    fillColor: 'rgba(200, 200, 200, 0.75)',
                    content: 'Connect',
                    contentStyle: {},
                    select: (ele: SingularData) => {
                        console.log(ele.id())
                        // @ts-ignore
                        this.cy.edgehandles().start(this.cy.$(ele));
                    },
                    enabled: true
                },
                {
                    fillColor: 'rgba(200, 200, 200, 0.75)',
                    content: 'Remove',
                    contentStyle: {},
                    select: function (ele: SingularData) {
                        console.log(ele.id())
                    },
                    enabled: true
                },

            ],
            fillColor: 'rgba(0, 0, 0, 0.75)', // the background colour of the menu
            activeFillColor: 'rgba(1, 105, 217, 0.75)', // the colour used to indicate the selected command
            activePadding: 20, // additional size in pixels for the active command
            indicatorSize: 24, // the size in pixels of the pointer to the active command, will default to the node size if the node size is smaller than the indicator size,
            separatorWidth: 3, // the empty spacing in pixels between successive commands
            spotlightPadding: 4, // extra spacing in pixels between the element and the spotlight
            adaptativeNodeSpotlightRadius: true, // specify whether the spotlight radius should adapt to the node size
            minSpotlightRadius: 24, // the minimum radius in pixels of the spotlight (ignored for the node if adaptativeNodeSpotlightRadius is enabled but still used for the edge & background)
            maxSpotlightRadius: 38, // the maximum radius in pixels of the spotlight (ignored for the node if adaptativeNodeSpotlightRadius is enabled but still used for the edge & background)
            openMenuEvents: 'cxttapstart taphold', // space-separated cytoscape events that will open the menu; only `cxttapstart` and/or `taphold` work here
            itemColor: 'white', // the colour of text in the command's content
            itemTextShadowColor: 'transparent', // the text shadow colour of the command's content
            zIndex: 9999, // the z-index of the ui div
            atMouse: false, // draw menu at mouse position
            outsideMenuCancel: false // if set to a number, this will cancel the command if the pointer is released outside of the spotlight, padded by the number given
        };
    }

    setupNavigator() {
        let defaults = {
            container: false, // html dom element
            viewLiveFramerate: 0, // set false to update graph pan only on drag end; set 0 to do it instantly; set a number (frames per second) to update not more than N times per second
            thumbnailEventFramerate: 30, // max thumbnail's updates per second triggered by graph updates
            thumbnailLiveFramerate: false, // max thumbnail's updates per second. Set false to disable
            dblClickDelay: 200, // milliseconds
            removeCustomContainer: false, // destroy the container specified by user on plugin destroy
            rerenderDelay: 100 // ms to throttle rerender updates to the panzoom for performance
        };
    }

    layout(name?: string) {
        if (name)
            this.cyLayout.name = name;
        this.cy.layout(this.cyLayout).run();
    }

    reset(data: any) {
        this.cy.nodes().remove();
        this.cy.edges().remove();
        if (data)
            this.cy.add(data);
    }

    private setListeners() {
        this.cy.on('cxttap', 'node', (evt: any) => {
            if (this.cy) { // @ts-ignore
                this.cy.edgehandles().start(this.cy.$('node:selected'));
            }
        });
    }
}
