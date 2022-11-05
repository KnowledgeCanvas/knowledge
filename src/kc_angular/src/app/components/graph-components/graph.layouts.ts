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
    this.setLayouts();
    console.log('Graph layout with options: ', this.commonOptions);
  }

  commonOptions: Partial<LayoutOptions & { simulate: boolean, maxSimulationTime: number }> = {
    animate: true,
    animationDuration: 500,
    fit: false,
    nodeDimensionsIncludeLabels: true,
    padding: 30,
    simulate: true,
    maxSimulationTime: 5000
  }

  // @ts-ignore
  layouts: CytoscapeLayout[] = [];

  setLayouts() {
    this.layouts = [
      {
        name: 'Centered',
        code: 'fcose',
        options: {
          ...this.commonOptions,
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
          idealEdgeLength: (_: any) => 100,
          nodeRepulsion(_: any): number {
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
          fit: true, // whether to fit the viewport to the graph
          directed: true, // whether the tree is directed downwards (or edges can point in any direction if false)
          padding: 30, // padding on fit
          circle: false, // put depths in concentric circles if true, put depths top down if false
          grid: true, // whether to create an even grid into which the DAG is placed (circle:false only)
          spacingFactor: 1.75, // positive spacing factor, larger => more space between nodes (N.B. n/a if causes overlap)
          boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
          avoidOverlap: true, // prevents node overlap, may overflow boundingBox if not enough space
          nodeDimensionsIncludeLabels: false, // Excludes the label when calculating node bounding boxes for the layout algorithm
          roots: undefined, // the roots of the trees
          maximal: true, // whether to shift nodes down their natural BFS depths in order to avoid upwards edges (DAGS only)
          depthSort: undefined, // a sorting function to order nodes at equal depth. e.g. function(a, b){ return a.data('weight') - b.data('weight') }

          animationEasing: undefined, // easing of animation if enabled,
          animateFilter: function (_, i: number) {
            return true;
          }, // a function that determines whether the node should be animated.  All nodes animated by default on animate enabled.  Non-animated nodes are positioned immediately when the layout starts
          ready: undefined, // callback on layoutready
          stop: undefined, // callback on layoutstop
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
      }
    ]

    if (this.commonOptions.simulate) {
      this.layouts.push({
        name: 'Simulate',
        code: 'cola',
        options: {
          ...this.commonOptions,
          name: 'cola',
          // @ts-ignore
          animate: true,
          refresh: 2, // number of ticks per frame; higher is faster but more jerky
          ungrabifyWhileSimulating: false, // so you can't drag nodes during layout
          fit: false, // on every layout reposition of nodes, fit the viewport
          padding: 30, // padding around the simulation
          boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }

          // positioning options
          randomize: false, // use random node positions at beginning of layout
          avoidOverlap: true, // if true, prevents overlap of node bounding boxes
          handleDisconnected: true, // if true, avoids disconnected components from overlapping
          convergenceThreshold: 0.01, // when the alpha value (system energy) falls below this value, the layout stops
          nodeSpacing: (_: any) => {
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
      })
    }
  }
}

