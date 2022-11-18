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
import {Component, EventEmitter, Input, NgZone, OnChanges, OnDestroy, OnInit, Output, SimpleChanges} from '@angular/core';
import {KnowledgeSource} from "../../models/knowledge.source.model";
import {KcProject} from "../../models/project.model";
import {ThemeService} from "../../services/user-services/theme.service";
import {CytoscapeLayout, GraphLayouts} from "./graph.layouts";
import cytoscape, {CytoscapeOptions, LayoutOptions} from "cytoscape";
import {GraphStyles} from "./graph.styles";
import {delay, takeUntil, tap} from "rxjs/operators";
import {SettingsService} from "../../services/ipc-services/settings.service";
import {NotificationsService} from "../../services/user-services/notifications.service";
import {Subject} from "rxjs";


/* Cytoscape Plugin Imports */
const cola = require('cytoscape-cola');
const dagre = require('cytoscape-dagre');
const klay = require('cytoscape-klay');
const fcose = require('cytoscape-fcose');

/* Register Plugins */
cytoscape.use(cola);
cytoscape.use(dagre);
cytoscape.use(klay);
cytoscape.use(fcose);

@Component({
  selector: 'graph-canvas',
  template: `
    <div class="w-full h-full">
      <graph-controls class="w-full"
                      [layouts]="graphLayouts.layouts"
                      [running]="running"
                      (onLayout)="onLayout($event)"
                      (onFit)="onFitToView()"
                      (onRun)="onRun()"
                      (onStop)="onStop()"
                      (onSettings)="onSettings()">
      </graph-controls>
      <div class="cy" id="cy"></div>
      <div class="graph-footer">
        {{projectNodeCount}} Projects, {{sourceNodeCount}} Sources
      </div>
    </div>
  `,
  styles: [
    `
      .cy {
        width: 100%;
        height: 100%;
        display: flex;
      }

      .graph-footer {
        min-width: 12rem;
        width: 24rem;
        max-width: 36rem;
        display: flex;
        position: absolute;
        right: 1rem;
        bottom: calc(48px + 1rem);
        flex-direction: column;
        flex-wrap: nowrap;
        align-content: center;
        align-items: flex-end;
        justify-content: space-between;
        z-index: 99;
      }
    `
  ]
})
export class GraphCanvasComponent implements OnInit, OnChanges, OnDestroy {
  @Output() onRunning = new EventEmitter<boolean>();

  @Output() onSourceTap = new EventEmitter<{ data: KnowledgeSource, event: MouseEvent }>();

  @Output() onSourceDblTap = new EventEmitter<{ data: KnowledgeSource, event: MouseEvent }>();

  @Output() onSourceCtxtap = new EventEmitter<{ data: KnowledgeSource[], event: MouseEvent }>();

  @Output() onProjectTap = new EventEmitter<{ data: KcProject, event: MouseEvent }>();

  @Output() onProjectDblTap = new EventEmitter<{ data: KcProject, event: MouseEvent }>();

  @Output() onProjectCtxtap = new EventEmitter<{ data: KcProject, event: MouseEvent }>();

  @Input() data: any[] = [];

  running: boolean = false;

  cy: cytoscape.Core | undefined;

  cyOptions?: CytoscapeOptions;

  projectNodeCount: number = 0;

  sourceNodeCount: number = 0;

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

  private cleanUp = new Subject();


  constructor(private theme: ThemeService,
              private settings: SettingsService,
              private ngZone: NgZone,
              private notifications: NotificationsService) {
    this.graphStyles = new GraphStyles();

    settings.graph.pipe(
      takeUntil(this.cleanUp),
      tap((graphSettings) => {
        this.commonOptions = {
          animate: graphSettings.animation.enabled,
          animationDuration: graphSettings.animation.enabled ? graphSettings.animation.duration : 0,
          fit: true,
          nodeDimensionsIncludeLabels: true,
          maxSimulationTime: graphSettings.simulation.maxTime,
          simulate: graphSettings.simulation.enabled
        }
        this.initialize();
      })
    ).subscribe()
  }

  ngOnInit(): void {
    this.theme.onThemeChange.pipe(
      takeUntil(this.cleanUp),
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
        this.add();
        this.onRun();
      })).subscribe()

    setTimeout(() => {
      this.onFitToView();
    }, 1000)
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!changes.data) {
      return;
    }

    if (changes.data.firstChange || !this.cy) {
      this.createCytoscape();
    } else if (this.cy) {
      this.cy?.destroy();
      this.createCytoscape();
    }

    if (this.cy) {
      this.add();
      this.onRun();
    }
  }

  ngOnDestroy() {
    this.cy?.destroy();
    document?.getElementById('cy')?.remove();
    this.cleanUp.next({});
    this.cleanUp.complete();
  }

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

  private add() {
    this.cy?.add(this.data);
    this.projectNodeCount = 1 + (this.cy?.nodes('[type="project"]').length ?? 0);
    this.sourceNodeCount = this.cy?.nodes('[type="ks"]').length ?? 0
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

  onLayout($event: CytoscapeLayout) {
    this.cyLayout = $event.options;
    this.onRun();
  }

  onFitToView() {
    this.cy?.fit();
  }

  async onRun() {
    this.ngZone.runOutsideAngular(() => {
      this.cy?.layout(this.cyLayout).run();
      /* If simulation is enabled and the current layout is not already "Simulate", schedule simulation */
      if (this.settings.get().app.graph.simulation.enabled && this.cyLayout.name !== 'cola') {
        const simLayout = this.graphLayouts.layouts.find(l => l.name === 'Simulate')?.options;
        if (simLayout) {
          setTimeout(() => {
            if (!this.running) {
              this.cy?.layout(simLayout).run()
            }
          }, this.settings.get().app.graph.animation.duration + (this.settings.get().app.graph.simulation.delay ?? 500))
        }
      }
    });

  }

  onSettings() {
    this.settings.show('graph');
  }

  onStop() {
    this.cy?.stop(true, true);
  }

  private setListeners() {
    if (!this.cy) {
      return;
    } else {
      this.cy.removeAllListeners()
    }

    const emit = (emitter: EventEmitter<any>, data: any, event: MouseEvent) => emitter.emit({data: data, event: event});

    this.ngZone.runOutsideAngular(() => {
      if (!this.cy) {
        return;
      }
      this.cy.on('onetap', 'node[type="ks"]', (event: any) => {
        const ks: KnowledgeSource = event.target[0]._private.data.ks;
        emit(this.onSourceTap, ks, event.originalEvent);
      })

      this.cy.on('dbltap', 'node[type="ks"]', (event: any) => {
        const ks: KnowledgeSource = event.target[0]._private.data.ks;
        emit(this.onSourceDblTap, ks, event.originalEvent);
      })

      this.cy.on('cxttap', 'node[type="ks"]', (event: any) => {
        // @ts-ignore
        const select: KnowledgeSource[] = this.cy?.nodes(':selected').map(n => n._private.data.ks).filter(n => n !== undefined);

        if (select && select.length > 0) {
          emit(this.onSourceCtxtap, select, event.originalEvent);
        } else {
          const ks: KnowledgeSource = event.target[0]._private.data.ks;
          emit(this.onSourceCtxtap, [ks], event.originalEvent);
        }
      });

      this.cy.on('onetap', 'node[type="project"]', (event: any) => {
        const project: KcProject = event.target[0]._private.data.project;
        emit(this.onProjectTap, project, event.originalEvent);
      })

      this.cy.on('dbltap', 'node[type="project"]', (event: any) => {
        const project: KcProject = event.target[0]._private.data.project;
        emit(this.onProjectDblTap, project, event.originalEvent);
      })

      this.cy.on('cxttap', 'node[type="project"]', (event: any) => {
        const project: KcProject = event.target[0]._private.data.project;
        emit(this.onProjectCtxtap, project, event.originalEvent);
      })

      this.cy.on('onetap', 'node[type="root"]', (event: any) => {
        const project: KcProject = event.target[0]._private.data.project;
        emit(this.onProjectTap, project, event.originalEvent);
      })

      this.cy.on('dbltap', 'node[type="root"]', (event: any) => {
        const project: KcProject = event.target[0]._private.data.project;
        emit(this.onProjectDblTap, project, event.originalEvent);
      })

      this.cy.on('cxttap', 'node[type="root"]', (event: any) => {
        const project: KcProject = event.target[0]._private.data.project;
        emit(this.onProjectCtxtap, project, event.originalEvent);
      })

      this.cy.on("layoutstop", () => {
        this.notifications.debug('Graph Canvas', 'Stopping Layout', '');
        if (this.settings.get().app.graph.display.autoFit) {
          this.cy?.fit();
        }

        this.running = false;
        this.onRunning.emit(this.running);
      });

      this.cy.on('layoutstart', () => {
        this.notifications.debug('Graph Canvas', 'Starting Layout', '');
        this.running = true;
        this.onRunning.emit(this.running);
      })
    })
  }
}
