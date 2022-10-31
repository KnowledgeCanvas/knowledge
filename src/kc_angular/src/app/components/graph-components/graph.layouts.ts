/**
 Copyright 2022 Rob Royce

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

import {LayoutOptions} from "cytoscape";

export interface CytoscapeLayout {
  name: string,
  code: string,
  options: LayoutOptions
}

export class GraphLayouts {
  constructor(common?: Partial<LayoutOptions>) {
    this.commonOptions = common ?? this.commonOptions;
  }

  private commonOptions: Partial<LayoutOptions> = {
    animate: true,
    animationDuration: 500,
    fit: false,
    nodeDimensionsIncludeLabels: true,
    padding: 30
  }

  layouts: CytoscapeLayout[] = [
    {
      name: 'Centered',
      code: 'fcose',
      options: {
        name: 'fcose',
        // @ts-ignore
        padding: 20, // fit padding
        componentSpacing: 1.2,
        nodeSeparation: 100,
        uniformNodeDimensions: true,
        sampleSize: 100,
        spacingFactor: 1, // Applies a multiplicative factor (>0) to expand or compress the overall area that the nodes take up
        nodeDimensionsIncludeLabels: true, // Applies a multiplicative factor (>0) to expand or compress the overall area that the nodes take up
        initialTemp: 99999,
        gravity: 50,
        idealEdgeLength: (edge: any) => 100,
        nodeRepulsion(node: any): number {
          return 999999;
        }
      }
    },
    {
      name: 'Hierarchical',
      code: 'klay',
      options: {
        ...this.commonOptions,
        name: 'klay',
        // @ts-ignore
        klay: {}
      }
    },
    {
      name: 'Directed',
      code: 'dagre',
      options: {
        ...this.commonOptions,
        name: 'dagre',
      }
    },
    {
      name: 'Breadth-first',
      code: 'breadthfirst',
      options: {
        ...this.commonOptions,
        name: 'breadthfirst',
      }
    },
    {
      name: 'Circular',
      code: 'circle',
      options: {
        ...this.commonOptions,
        name: 'circle',
      }
    },
    {
      name: 'Concentric',
      code: 'concentric',
      options: {
        ...this.commonOptions,
        name: 'concentric',
      }
    },
    {
      name: 'Simulate',
      code: 'cola',
      options: {
        ...this.commonOptions,
        name: 'cola',
        // @ts-ignore
        refresh: 2, // number of ticks per frame; higher is faster but more jerky
        maxSimulationTime: 10000, // max length in ms to run the layout
        ungrabifyWhileSimulating: false, // so you can't drag nodes during layout
        fit: false, // on every layout reposition of nodes, fit the viewport
        padding: 30, // padding around the simulation
        boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
        nodeDimensionsIncludeLabels: true, // whether labels should be included in determining the space used by a node

        // layout event callbacks
        ready: function ready() {
        }, // on layoutready
        stop: function stop() {
        }, // on layoutstop

        // positioning options
        randomize: false, // use random node positions at beginning of layout
        avoidOverlap: true, // if true, prevents overlap of node bounding boxes
        handleDisconnected: true, // if true, avoids disconnected components from overlapping
        convergenceThreshold: 0.05, // when the alpha value (system energy) falls below this value, the layout stops
        nodeSpacing: (node: any) => {
          return 10;
        }, // extra spacing around nodes
        flow: undefined, // use DAG/tree flow layout if specified, e.g. { axis: 'y', minSeparation: 30 }
        alignment: undefined, // relative alignment constraints on nodes, e.g. function( node ){ return { x: 0, y: 1 } }
        gapInequalities: undefined, // list of inequality constraints for the gap between the nodes, e.g. [{"axis":"y", "left":node1, "right":node2, "gap":25}]
        centerGraph: false, // adjusts the node positions initially to center the graph (pass false if you want to start the layout from the current position)


        // different methods of specifying edge length
        // each can be a constant numerical value or a function like `function( edge ){ return 2; }`
        edgeLength: undefined, // sets edge length directly in simulation
        edgeSymDiffLength: undefined, // symmetric diff edge length in simulation
        edgeJaccardLength: undefined, // jaccard edge length in simulation

        // iterations of cola algorithm; uses default values on undefined
        unconstrIter: undefined, // unconstrained initial layout iterations
        userConstIter: undefined, // initial layout iterations with user-specified constraints
        allConstIter: undefined, // initial layout iterations with all constraints including non-overlap

        // infinite layout options
        infinite: false // overrides all other options for a forces-all-the-time mode
      }
    }
  ]
}

