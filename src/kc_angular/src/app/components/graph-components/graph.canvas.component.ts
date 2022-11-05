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

import {Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges} from '@angular/core';
import {KnowledgeSource} from "../../models/knowledge.source.model";
import {KcProject} from "../../models/project.model";
import {ThemeService} from "../../services/user-services/theme.service";
import {CytoscapeLayout, GraphLayouts} from "./graph.layouts";
import cytoscape, {CytoscapeOptions, LayoutOptions} from "cytoscape";
import {GraphStyles} from "./graph.styles";
import {delay, tap} from "rxjs/operators";
import {SettingsService} from "../../services/ipc-services/settings.service";

cytoscape.use(require('cytoscape-cola'));
cytoscape.use(require('cytoscape-dagre'));
cytoscape.use(require('cytoscape-klay'));
cytoscape.use(require('cytoscape-fcose'));

@Component({
  selector: 'graph-canvas',
  template: `
    <div class="w-full h-full">
      <graph-controls class="w-full"
                      [layouts]="graphLayouts.layouts"
                      [running]="running"
                      (onLayout)="onLayout($event)"
                      (onReset)="onFitToView()"
                      (onRun)="onRun()"
                      (onStop)="onStop()"
                      (onSettings)="onSettings()">
      </graph-controls>
      <div #cy class="cy" id="cy"></div>
    </div>
  `,
  styles: [
    `
      .cy {
        width: 100%;
        height: 100%;
        display: flex;
      }
    `
  ]
})
export class GraphCanvasComponent implements OnInit, OnChanges, OnDestroy {
  @Output() onReady = new EventEmitter();

  @Output() onSourceTap = new EventEmitter<{ data: KnowledgeSource, event: MouseEvent }>();

  @Output() onSourceCtxtap = new EventEmitter<{ data: KnowledgeSource, event: MouseEvent }>();

  @Output() onProjectTap = new EventEmitter<{ data: KcProject, event: MouseEvent }>();

  @Output() onProjectCtxtap = new EventEmitter<{ data: KcProject, event: MouseEvent }>();

  @Input() data: any[] = [];

  running: boolean = false;

  cy?: cytoscape.Core;

  cyOptions?: CytoscapeOptions;

  private graphStyles: GraphStyles;

  private commonOptions = {
    animate: true,
    animationDuration: 1000,
    fit: true,
    nodeDimensionsIncludeLabels: true,
    maxSimulationTime: 5000,
    simulate: true
  }

  graphLayouts: GraphLayouts = new GraphLayouts(this.commonOptions);

  cyLayout: LayoutOptions = {
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
  };


  initialize() {
    this.graphLayouts = new GraphLayouts(this.commonOptions);

    this.cyLayout = {
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
    };
  }

  constructor(private theme: ThemeService,
              private settings: SettingsService) {
    this.graphStyles = new GraphStyles();

    settings.graph.pipe(
      tap((graphSettings) => {
        this.commonOptions = {
          animate: graphSettings.animation.enabled,
          animationDuration: graphSettings.animation.enabled ? graphSettings.animation.duration : 0,
          fit: true,
          nodeDimensionsIncludeLabels: true,
          maxSimulationTime: graphSettings.simulation.maxTime,
          simulate: graphSettings.simulation.enabled
        }
        console.log('Initializing with common options: ', this.commonOptions);
        this.initialize();
      })
    ).subscribe()
  }

  ngOnInit(): void {
    this.theme.onThemeChange.pipe(
      delay(500),
      tap(() => {
        if (!this.cyOptions) {
          return;
        }

        this.graphStyles = new GraphStyles();
        this.cyOptions.style = this.graphStyles.styles;

        if (this.cy) {
          this.cy.nodes().remove();
          this.cy.edges().remove();
          this.cy.destroy();
        }
        this.createCytoscape();
        this.addRunFit();
      })).subscribe()

    setTimeout(() => {
      this.onFitToView();
    }, 1000)
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!changes.data) {
      return;
    }

    this.onStop();

    /*
     First Change OR Graph DNE ==> Init
      - Initialize cytoscape with predefined options
      - Create listener callbacks for graph events (click, right click, etc.)
     Subsequent changes ==> Repurpose existing graph
      - Remove current nodes/edges
     All cases => Run
      - Add nodes to Cytoscape graph
      - Apply selected layout (provided by Graph Controls Component)
      - Fit the Graph into current view
     */
    if (changes.data.firstChange || !this.cy) {
      this.createCytoscape();
    } else if (this.cy) {
      this.cy.nodes().remove();
      this.cy.edges().remove();
    }

    if (this.cy) {
      this.addRunFit();
    }
  }

  ngOnDestroy() {
    this.onStop();
    document?.getElementById('cy')?.remove();
  }

  private addRunFit() {
    this.cy?.add(this.data);
    this.onRun();
  }

  private createCytoscape() {
    this.cyOptions = {
      container: document.getElementById('cy'),
      layout: this.cyLayout,
      minZoom: 0.1,
      maxZoom: 2,
      boxSelectionEnabled: true,
      style: this.graphStyles.styles
    }
    this.cy = cytoscape(this.cyOptions);
    this.setListeners();
  }

  private setListeners() {
    if (!this.cy) {
      return;
    }

    const emit = (emitter: EventEmitter<any>, data: any, event: MouseEvent) => emitter.emit({data: data, event: event});

    this.cy.on('tap', 'node[type="ks"]', (event: any) => {
      const ks: KnowledgeSource = event.target[0]._private.data.ks;
      emit(this.onSourceTap, ks, event.originalEvent);
    })

    this.cy.on('cxttap', 'node[type="ks"]', (event: any) => {
      const ks = event.target[0]._private.data.ks;
      emit(this.onSourceCtxtap, ks, event.originalEvent);
    });

    this.cy.on('tap', 'node[type="project"]', (event: any) => {
      const project: KcProject = event.target[0]._private.data.project;
      emit(this.onProjectTap, project, event.originalEvent);
    })

    this.cy.on('cxttap', 'node[type="project"]', (event: any) => {
      const project: KcProject = event.target[0]._private.data.project;
      emit(this.onProjectCtxtap, project, event.originalEvent);
    })

    this.cy.on('tap', 'node[type="root"]', (event: any) => {
      const project: KcProject = event.target[0]._private.data.project;
      emit(this.onProjectTap, project, event.originalEvent);
    })

    this.cy.on('cxttap', 'node[type="root"]', (event: any) => {
      const project: KcProject = event.target[0]._private.data.project;
      emit(this.onProjectCtxtap, project, event.originalEvent);
    })

    this.cy.on('tap', 'edge', (_: any) => {
      console.log('click on edge...'); // TODO:
    })

    this.cy.on('cxttap', 'edge', (_: any) => {
      console.log('right click on edge...'); // TODO:
    });

    this.cy.on("layoutstop", () => {
      this.cy?.fit();
      this.running = false;
    });

    this.cy.on('layoutstart', () => {
      this.running = true;
    })

  }


  onLayout($event: CytoscapeLayout) {
    this.cyLayout = $event.options;
    this.onRun();
  }

  async onFitToView() {
    await this.cy?.fit();
  }

  onResetView() {
    this.cy?.reset();
  }

  async onRun() {
    this.onStop();
    this.running = true;
    this.cy?.layout(this.cyLayout).run();
  }

  onSettings() {
    this.settings.show('graph');
  }

  onStop() {
    console.log('Stopping layout...');
    this.cy?.stop(true, true);
  }
}
