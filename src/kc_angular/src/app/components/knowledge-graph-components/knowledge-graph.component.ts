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

import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import * as d3 from "d3";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {ProjectTreeNode} from "../../models/project.tree.model";

export interface KnowledgeGraphConfig {
  type: 'project-hierarchy'
  projectTree?: ProjectTreeNode[],
  projectId?: string
}

export interface KnowledgeGraphStatus {
  error?: any;
  success?: any;
}

@Component({
  selector: 'app-knowledge-graph',
  templateUrl: './knowledge-graph.component.html',
  styleUrls: ['./knowledge-graph.component.scss']
})
export class KnowledgeGraphComponent implements OnInit {
  @ViewChild('knowledge_canvas') kc!: ElementRef;
  private graphConfig: KnowledgeGraphConfig;
  private svg: any;
  private margin = 4;
  private width?: number;
  private height?: number;
  private DX = 52;
  private DY = 52;
  private tree = d3.tree().nodeSize([this.DX, this.DY]);
  private treeLink = d3.linkHorizontal().x((d: any) => d.y).y((d: any) => d.x);

  constructor(public ref: DynamicDialogRef, public config: DynamicDialogConfig) {
    this.graphConfig = config.data;
  }

  ngOnInit(): void {
    this.drawProjectHierarchy();
  }

  createSvg(width: number, height: number, margin: number, x0: number, x1: number) {
    return d3.select("#knowledge_canvas")
      .append("svg")
      .attr("viewBox", [-this.DY * margin / 2, x0 - this.DX, width, height])
      // .attr("width", width)
      // .attr("height", height)
      .attr("style", "width: 100%; height: 100%")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10);
  }

  highlight(d: any) {
    return false;
  }

  Pack(data: any, // data is either tabular (array of objects) or hierarchy (nested objects)
       path?: any, // as an alternative to id and parentId, returns an array identifier, imputing internal nodes
       id = Array.isArray(data) ? (d: any) => d.id : null, // if tabular data, given a d in data, returns a unique identifier (string)
       parentId = Array.isArray(data) ? (d: any) => d.parentId : null, // if tabular data, given a node d, returns its parent’s identifier
       children?: any, // if hierarchical data, given a d in data, returns its children
       value?: any, // given a node d, returns a quantitative value (for area encoding; null for count)
       sort = (a: any, b: any) => d3.descending(a.value, b.value), // how to sort nodes prior to layout
       label?: any, // given a leaf node d, returns the display name
       title?: any, // given a node d, returns its hover text
       link?: any, // given a node d, its link (if any)
       linkTarget = "_blank", // the target attribute for links, if any
       width = 640, // outer width, in pixels
       height = 400, // outer height, in pixels
       margin = 1, // shorthand for margins
       marginTop = margin, // top margin, in pixels
       marginRight = margin, // right margin, in pixels
       marginBottom = margin, // bottom margin, in pixels
       marginLeft = margin, // left margin, in pixels
       padding = 3, // separation between circles
       fill = "#ddd", // fill for leaf circles
       fillOpacity?: any, // fill opacity for leaf circles
       stroke = "#bbb", // stroke for internal circles
       strokeWidth?: any, // stroke width for internal circles
       strokeOpacity?: any) { // stroke opacity for internal circles

    if (!this.graphConfig?.projectTree || !this.graphConfig?.projectTree[0]) {
      return;
    }


    let hierarchy: d3.HierarchyNode<any> = d3.hierarchy(data, (p) => {
      return p.subprojects;
    });
    let root = this.tree(hierarchy);

    // Compute the values of internal nodes by aggregating from the leaves.
    value == null ? root.count() : root.sum(d => Math.max(0, value(d)));

    // Compute labels and titles.
    const descendants = root.descendants();
    const leaves = descendants.filter((d: any) => !d.children);
    leaves.forEach((d: any, i: any) => d.index = i);
    const L = label == null ? null : leaves.map((d: any) => label(d.data, d));
    const T = title == null ? null : descendants.map((d: any) => title(d.data, d));

    // Sort the leaves (typically by descending value for a pleasing layout).
    if (sort != null) root.sort(sort);

    // Compute the layout.
    d3.pack()
      .size([width - marginLeft - marginRight, height - marginTop - marginBottom])
      .padding(padding)
      (root);

    const svg = d3.create("svg")
      .attr("viewBox", [-marginLeft, -marginTop, width, height])
      .attr("width", width)
      .attr("height", height)
      .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .attr("text-anchor", "middle");

    const node = svg.selectAll("a")
      .data(descendants)
      .join("a")
      .attr("xlink:href", link == null ? null : (d, i) => link(d.data, d))
      .attr("target", link == null ? null : linkTarget)
      .attr("transform", d => `translate(${d.x},${d.y})`);

    node.append("circle")
      .attr("fill", d => d.children ? "#fff" : fill)
      .attr("fill-opacity", d => d.children ? null : fillOpacity)
      .attr("stroke", d => d.children ? stroke : null)
      .attr("stroke-width", d => d.children ? strokeWidth : null)
      .attr("stroke-opacity", d => d.children ? strokeOpacity : null)
    // .attr("r", d => d.r);

    if (T) node.append("title").text((d, i) => T[i]);


    return svg.node();
  }

  private drawProjectHierarchy() {
    if (!this.graphConfig?.projectTree || !this.graphConfig?.projectTree[0]) {
      return;
    }

    let data = this.graphConfig.projectTree[0];

    if (this.graphConfig.projectId) {
      let node = this.graphConfig.projectTree.find(p => p.id === this.graphConfig.projectId);
      if (node) {
        data = node;
      }
    }

    if (!data) {
      console.warn('Unable to configure Knowledge Graph because the provided project tree does not exist.');
      let status: KnowledgeGraphStatus = {
        error: true
      }
      this.ref.close(status)
      return;
    }

    let hierarchy: d3.HierarchyNode<any> = d3.hierarchy(data, (p) => {
      return p.subprojects;
    });
    let root = this.tree(hierarchy);
    console.log('Hierarchy root: ', root);

    const descendants = root.descendants();
    // @ts-ignore
    const L = descendants.map(d => d.data.name);

    // Center the tree.
    let x0 = Infinity;
    let x1 = -x0;
    root.each(d => {
      if (d.x > x1) x1 = d.x;
      if (d.x < x0) x0 = d.x;
    });

    this.svg = this.createSvg(800, 650, 10, x0, x1);

    const link = this.svg.append('g')
      .attr("fill", "none")
      .attr("stroke", "#555")
      .attr("stroke-opacity", 0.4)
      .attr("stroke-width", 1.5)
      .selectAll("path")
      .data(root.links())
      .join("path")
      .attr("stroke", (d: any) => this.highlight(d.source) && this.highlight(d.target) ? "red" : null)
      .attr("stroke-opacity", (d: any) => this.highlight(d.source) && this.highlight(d.target) ? 1 : null)
      .attr("d", this.treeLink);

    const node = this.svg.append('g')
      .attr('stroke-linejoin', 'round')
      .attr('stroke-width', 3)
      .selectAll('g')
      .data(root.descendants())
      .join('g')
      .attr("transform", (d: any) => `translate(${d.y},${d.x})`);

    node.append("circle")
      .attr("fill", (d: any) => this.highlight(d) ? "red" : d.children ? "#555" : "#999")
      .attr("r", 2.5);

    let label = 'Test';

    node.append("text")
      .attr("fill", (d: any) => this.highlight(d) ? "red" : null)
      .attr("dy", "0.31em")
      .attr("x", (d: any) => d.children ? -6 : 6)
      .attr("text-anchor", (d: any) => d.children ? "end" : "start")
      .text((d: any, i: any) => L[i])
      .clone(true).lower()
      .attr("stroke", "white");
  }
}
