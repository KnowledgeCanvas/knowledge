/*
 * Copyright (c) 2022-2023 Rob Royce
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import {KnowledgeSource} from "../../models/knowledge.source.model";
import {KcProject} from "../../models/project.model";
import {ThemeService} from "../../services/user-services/theme.service";
import {CytoscapeLayout, GraphLayouts} from "./graph.layouts";
import cytoscape, {CytoscapeOptions, ExportBlobOptions, LayoutOptions} from "cytoscape";
import {GraphStyles} from "./graph.styles";
import {bufferTime, debounceTime, delay, filter, take, takeUntil, tap} from "rxjs/operators";
import {SettingsService} from "../../services/ipc-services/settings.service";
import {NotificationsService} from "../../services/user-services/notifications.service";
import {BehaviorSubject, forkJoin, Observable, skip, Subject} from "rxjs";
import {SearchService} from "../../services/user-services/search.service";
import {SearchResult} from "./graph-search.component";

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

const defaultLayout = {
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

@Component({
  selector: 'graph-canvas',
  template: `
    <div class="w-full h-full">
      <graph-controls class="w-full"
                      [layouts]="graphLayouts.layouts"
                      [running]="running"
                      (onLayout)="onLayout($event)"
                      (onFit)="onFitToView()"
                      (onScreenshot)="onScreenshot()"
                      (onRun)="onRun()"
                      (onStop)="onStop()"
                      (onSettings)="onSettings()"
                      (onSearch)="onSearch($event)"
                      (onSearchNext)="onSearchNext()">
      </graph-controls>
      <graph-search [sources]="(searchSources | async) ?? []"
                    [selectedIndex]="selectedIndex"
                    footerText="{{projectNodeCount}} Projects, {{sourceNodeCount}} Sources, {{selectedCount}} selected"
                    (onResultClicked)="onResultClicked($event)"
                    (onContextMenu)="onSourceCtxtap.emit($event)"
                    (onNext)="onSearchNext($event)">
      </graph-search>
      <graph-status [running]="running"></graph-status>
      <div class="cy" id="cy"></div>
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

  selectedCount: number = 0;

  selectedIndex: number = 0;

  private _searchSources: BehaviorSubject<(KnowledgeSource & SearchResult)[]> = new BehaviorSubject<(KnowledgeSource & SearchResult)[]>([]);

  searchSources: Observable<(KnowledgeSource & SearchResult)[]> = this._searchSources.asObservable();

  private graphStyles: GraphStyles;

  private commonOptions = {
    animate: true,
    animationDuration: 1000,
    fit: true,
    nodeDimensionsIncludeLabels: true,
    maxSimulationTime: 5000,
    simulate: true
  }

  private _windowResize = new BehaviorSubject({});

  private _selection = new BehaviorSubject({});

  private _boxSelected = new BehaviorSubject({});

  private _selectedIndex = new BehaviorSubject<number>(0);

  graphLayouts: GraphLayouts = new GraphLayouts(this.commonOptions);

  cyLayout: LayoutOptions = {...this.commonOptions, ...defaultLayout};

  private cleanUp = new Subject();


  constructor(private theme: ThemeService,
              private settings: SettingsService,
              private ngZone: NgZone,
              private notifications: NotificationsService,
              private search: SearchService) {
    this.graphStyles = new GraphStyles();

    settings.graph.pipe(
      takeUntil(this.cleanUp),
      tap((graphSettings) => {
        this.commonOptions = {
          animate: graphSettings.animation.enabled,
          animationDuration: graphSettings.animation.enabled ? graphSettings.animation.duration : 0,
          fit: true,
          nodeDimensionsIncludeLabels: true,
          maxSimulationTime: graphSettings.simulation.infinite ? 9999999 : graphSettings.simulation.maxTime,
          simulate: graphSettings.simulation.enabled
        }
        this.initialize();
      })
    ).subscribe()

    this._windowResize.asObservable().pipe(
      takeUntil(this.cleanUp),
      debounceTime(100),
      delay(100),
      tap(() => {
        this.onFitToView()
      })
    ).subscribe()

    this._selection.asObservable().pipe(
      takeUntil(this.cleanUp),
      debounceTime(250),
      tap((_) => {
        this.selectedCount = this.cy?.nodes(':selected')?.nodes?.length ?? 0;
      })
    ).subscribe()

    this._boxSelected.asObservable().pipe(
      skip(1),
      takeUntil(this.cleanUp),
      bufferTime(250),
      filter(s => s.length > 0),
      tap((selected: any[]) => {
        this.removeStyles();
        const elems = this.cy?.collection(selected).nodes('[type="ks"]').select();
        const sources: (KnowledgeSource & SearchResult)[] = elems?.map(s => s.data('ks')) ?? [];
        this.highlightPath()
        this._searchSources.next(sources);
      })
    ).subscribe()

    this._selectedIndex.asObservable().pipe(
      takeUntil(this.cleanUp),
      filter(s => s >= -1),
      skip(1),
      debounceTime(50),
      tap((index) => {
        /* The only time -1 is used is when there is a NEW search term. In such case, we do not want to reselect nodes in the onIndexChange function */
        this.selectedIndex = index === -1 ? 0 : index;
        this.onIndexChange(index !== -1, index === -1);
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

    this.onCenter('[type="root"]', 0)

    setTimeout(() => {
      this.onFitToView(0);
    }, 1000)
  }

  ngOnChanges(changes: SimpleChanges) {
    // If there is no data, we do not need to do anything.
    if (!changes.data) {
      return;
    }

    // If there is no cytoscape instance, or if the previous data was empty, we need to construct the graph from scratch.
    if (changes.data.firstChange || !this.cy || changes.data.previousValue.length === 0) {
      this.createCytoscape();
      this.add();
      this.onRun();
      return;
    }

    // If we get here, we are updating the graph and the update will depend on delta between previous and current data.
    const prevData = changes.data.previousValue;
    const currData = changes.data.currentValue;

    // First, determine if this is the same root project as before. If it is not, rebuild the graph.
    const prevRoot = prevData.find((p: any) => p.data.type === 'root');
    const currRoot = currData.find((p: any) => p.data.type === 'root');
    if (prevRoot.data.id !== currRoot.data.id) {
      this.cy?.destroy();
      this.createCytoscape();
      this.add();
      this.onRun();
      return;
    }

    // If the root node is the same, check if any of the other nodes have changed.
    // The only changes we care about are if the label has changed or if the node is no longer in the graph.
    // Any other changes will result in the same graph, so we can safely ignore them.
    prevData.forEach((p: any) => {
      const curr = currData.find((c: any) => c.data.id === p.data.id);

      // If the node is not in the current data, remove it from the graph.
      if (!curr) {
        this.cy?.remove(`node[id="${p.data.id}"]`);
        return;
      }

      // If the node is the same, but the label has changed, update the label.
      if (p.data.label !== curr.data.label) {
        this.cy?.elements(`node[id="${p.data.id}"]`).data(curr.data);
        return;
      }
    });

    // Clear out the search sources
    this._searchSources.next([]);
  }

  ngOnDestroy() {
    this.cy?.destroy();
    document?.getElementById('cy')?.remove();
    this.cleanUp.next({});
    this.cleanUp.complete();
  }

  initialize() {
    this.graphLayouts = new GraphLayouts(this.commonOptions);
    this.cyLayout = {...this.commonOptions, ...defaultLayout};
  }

  private add(data?: any) {
    this.cy?.add(data ?? this.data);
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
    this.selectedIndex = 0;
    this._searchSources.next([]);
    this.cy = cytoscape(this.cyOptions);
    this.setListeners();
  }

  /**
   * Use Dijkstra's to highlight the paths from root to all search results.
   * @param root: defaults to [type="root"]
   * @param selector: defaults to :selected
   */
  highlightPath(selector: string = ':selected', root: string = '[type="root"]') {
    const dijkstra = this.cy?.elements().dijkstra({
      root: root,
      directed: true
    })
    let paths = this.cy?.nodes(selector).map((node) => dijkstra?.pathTo(node));
    paths?.map(c => c?.nodes().addClass('search-path-node').select());
    paths?.map(c => c?.edges().addClass('search-path-edge').select());
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
        const shiftKey = event.originalEvent?.shiftKey ?? false;
        const ctrlKey = event.originalEvent?.ctrlKey ?? false;
        const metaKey = event.originalEvent?.metaKey ?? false;

        // Holding any of these keys will select the node instead of performing an action
        if (!shiftKey && !ctrlKey && !metaKey) {
          const ks: KnowledgeSource = event.target[0]._private.data.ks;
          if (ks) {
            emit(this.onSourceTap, ks, event.originalEvent);
          } else {
            this.notifications.error('Graph Canvas', 'Invalid Source', 'Event target should include a copy of the Source, but it does not.');
          }
        }
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
          this.onFitToView();
        }

        this.running = false;
        this.onRunning.emit(this.running);
      });

      this.cy.on('layoutstart', () => {
        this.notifications.debug('Graph Canvas', 'Starting Layout', '');
        this.running = true;
        this.onRunning.emit(this.running);
      })

      this.cy.on('select', (event: any) => {
        this._selection.next(event);
      })

      this.cy.on('boxselect', (event: any) => {
        this.removeStyles();
        this._boxSelected.next(event.target);
      })
    })
  }

  onLayout($event: CytoscapeLayout) {
    this.cyLayout = $event.options;
    this.onRun();
  }

  onFitToView(timeoutms: number = 1000) {
    this.cy?.animation({
      fit: {
        eles: this.cy?.nodes(),
        padding: 15
      },
      duration: this.settings.get().app.graph.animation.enabled ? timeoutms : 0,
      easing: 'ease-in-out-quart'
    }).play().promise()
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

  /**
   * Perform a search on all nodes in the current graph.
   * @param term: The term to search for.
   */
  onSearch(term: string) {
    // Reset styles whenever search results change
    this.cy?.elements().removeClass('search-result not-search-result search-path-edge search-path-node').unselect();

    let matches = [];
    let sources: (KnowledgeSource & SearchResult)[] = [];

    /* Get results from search service */
    const results = this.search.graph(this.data.map(v => v.data.ks), term);

    /* For each result, find the corresponding graph node and apply class/style changes */
    for (let result of results) {
      /* Search items contain either Source or Project data */
      const item = result.item;

      /* The score according to Fuse.js, lower is better */
      const score = result.score;

      /* Both Source and Project have the same ID schema */
      const id = item.id.value;
      if (id) {
        let node = this.cy?.nodes(`[id="${id}"]`).classes('search-result').select();
        if (item.title?.length > 0) {
          matches.push(node); // move this line outside the if statement to include projects in the search results
          sources.push({...item, score: score});
        }
      }
    }

    if (term.trim().length === 0 || matches.length === 0) {
      this._selection.next({});
      this._searchSources.next([]);
      if (this.settings.get().app.graph.display.autoFit) {
        this.onFitToView();
      }
      return;
    }

    this.highlightPath();
    this.cy?.nodes(':unselected').classes('not-search-result');
    this._searchSources.next(sources);
    this._selectedIndex.next(-1);
  }

  /**
   * Centers the view over node described my `selector`. Normal animates for 1000ms unless `timeoutms` is specified.
   * @param selector: A selector describing the node to be centered
   * @param timeoutms: How long to animate the transition (default: 1000ms)
   * @param zoom: Zoom level on center (default: 1)
   */
  async onCenter(selector: string, timeoutms: number = 1000, zoom: number = 1) {
    return this.cy?.animation({
      zoom: zoom,
      center: {
        eles: this.cy?.filter(selector)
      },
      duration: this.settings.get().app.graph.animation.enabled ? timeoutms : 0,
      easing: 'ease-in-out-quart'
    }).play().promise()
  }


  /**
   * Used particularly when a source is __clicked__ in the search results.
   * @param source
   */
  onResultClicked(source: KnowledgeSource & SearchResult) {
    this._selectedIndex.next(source.index)
  }

  onSearchNext(backward: boolean = false) {
    const sources$ = this.searchSources.pipe(take(1))
    const index$ = this._selectedIndex.asObservable().pipe(take(1))
    forkJoin([sources$, index$]).pipe(
      take(1),
      tap(([sources, index]) => {
        const count = sources.length;
        let selectedIndex: number;
        if (backward) {
          selectedIndex = index === 0 ? count - 1 : index - 1;
        } else {
          selectedIndex = index === count - 1 ? 0 : index + 1;
        }
        this._selectedIndex.next(selectedIndex);
      })
    ).subscribe()
  }

  private removeStyles() {
    this.cy?.elements().removeClass('search-path-node search-path-edge').unselect();
  }

  onIndexChange(reselect: boolean, zoomOutcenter: boolean) {
    if (this._searchSources.value.length === 0) {
      return;
    }
    const source = this._searchSources.value[this.selectedIndex];
    const selector = `[id="${source.id.value}"]`;

    if (reselect) {
      this.removeStyles();
    }

    this.cy?.nodes(selector).select();

    this.highlightPath();

    if (this.settings.get().app.graph.display.autoFit) {
      if (zoomOutcenter) {
        this.onFitToView()
      } else {
        this.onCenter(selector);
      }
    }
  }

  onScreenshot() {
    const options: ExportBlobOptions = {
      output: 'blob',
      bg: getComputedStyle(document.documentElement).getPropertyValue('--surface-a'),
      scale: 3
    }
    let png64: Blob | undefined = this.cy?.png(options);
    if (png64) {
      let link = document.createElement("a");
      link.style.display = 'none';
      document.body.appendChild(link);

      if (link.download !== undefined) {
        link.setAttribute('href', URL.createObjectURL(png64));
        link.setAttribute('download', 'knowledge_graph.png');
        link.click();
      }
      document.body.removeChild(link);
    }
  }

  @HostListener('window:resize', ["$event"])
  windowResize(_: any) {
    this._windowResize.next({});
  }

  @HostListener('document:keydown.Control.]')
  @HostListener('document:keydown.meta.]')
  keyPressNext() {
    this.onSearchNext();
  }

  @HostListener('document:keydown.Control.[')
  @HostListener('document:keydown.meta.[')
  keyPressPrevious() {
    this.onSearchNext(true);
  }

  @HostListener('document:keydown.Control.t')
  @HostListener('document:keydown.meta.t')
  keyPressTop() {
    this._selectedIndex.next(0);
  }
}
