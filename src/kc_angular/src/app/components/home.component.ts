/*
 * Copyright (c) 2022 Rob Royce
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
import {Component, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {KnowledgeSource} from "../models/knowledge.source.model";
import {IngestService} from "../services/ingest-services/ingest.service";
import {ProjectService} from "../services/factory-services/project.service";
import {Observable, Subject} from "rxjs";
import {KcProject} from "../models/project.model";
import {ConfirmationService, FilterService, MenuItem, TreeNode} from "primeng/api";
import {NotificationsService} from "../services/user-services/notifications.service";
import {KsContextMenuService} from "../services/factory-services/ks-context-menu.service";
import {Splitter} from "primeng/splitter";
import {KsFactoryService} from "../services/factory-services/ks-factory.service";
import {map, take, takeUntil, tap} from "rxjs/operators";
import {DragAndDropService} from "../services/ingest-services/drag-and-drop.service";
import {ProjectTreeFactoryService} from "../services/factory-services/project-tree-factory.service";
import {SettingsService} from "../services/ipc-services/settings.service";

@Component({
  selector: 'app-home',
  template: `
    <p-contextMenu #cm
                   styleClass="shadow-7"
                   [model]="ksMenuItems"
                   [baseZIndex]="999999"
                   [autoZIndex]="true"
                   appendTo="body">
    </p-contextMenu>

    <div class="inbox-container width-constrained flex flex-column h-full w-full align-items-center">
      <div class="inbox-header flex-grow-0 w-full">
        <div class="flex flex-row justify-content-between align-items-center p-2">
          <div class="flex flex-row">
            <button pButton class="ml-1" label="Import" [disabled]="!upNext || upNext.length === 0 || !selectedProject.key" (click)="onProjectImport()"></button>
            <project-selector [disabled]="!upNext || upNext.length === 0" class="w-16rem"
                              [showClear]="false"
                              (onSelect)="selectedProject = $event"
                              placeholder="Import to Project..."></project-selector>
          </div>

          <div class="flex flex-row">
            <button pButton
                    icon="pi pi-arrow-down"
                    label="Expand"
                    [disabled]="!active"
                    (click)="expandAll()"
                    class="p-button-rounded p-button-text shadow-none"></button>
            <button pButton
                    icon="pi pi-arrow-up"
                    label="Collapse"
                    [disabled]="!active"
                    (click)="collapseAll()"
                    class="p-button-rounded p-button-text shadow-none"></button>
          </div>
        </div>
      </div>

      <div class="inbox-content flex-grow-1 h-full w-full overflow-y-auto">
        <div class="w-full h-full flex app-splitter-container">
          <div class="app-splitter-left">
            <div *ngIf="upNext.length > 0" class="h-full pl-2" style="overflow-y: auto">
              <div class="">
                <div class="p-input-icon-left w-full">
                  <i class="pi pi-filter"></i>
                  <input type="text"
                         pInputText
                         #filter
                         style="height: 40px; width: 100%"
                         placeholder="Filter"
                         (input)="onFilter($event, filter.value)"
                         class="w-full p-fluid">
                </div>
              </div>
              <div>
                <app-ks-message *ngFor="let ks of filtered"
                                [ks]="ks"
                                (click)="setActive(ks, $event)"
                                (contextmenu)="setContext(ks); onKsContextMenu(context); cm.show($event)"
                                [active]="active && (ks.id.value === (active.id.value))">
                </app-ks-message>
              </div>
            </div>

            <div *ngIf="upNext.length == 0" class="" id="inbox-side-panel" #inboxSidePanel>
              <div style="width: 100%;" class="hover:surface-hover text-primary">
                <app-ks-message class="cursor-pointer hover:surface-hover"
                                (click)="loadExamples()"
                                status="Click to load examples">
                </app-ks-message>
              </div>
            </div>
            <div class="w-full" *ngIf="loading">
              <p-progressBar mode="indeterminate" [style]="{'height': '0.5rem'}"></p-progressBar>
            </div>
          </div>

          <div class="app-splitter-right">
            <div *ngIf="active" class="w-full h-full flex flex-column">
              <div class="overflow-y-auto">
                <app-ks-info *ngIf="active"
                             [ks]="active"
                             [collapseAll]="collapsed"
                             (onRemove)="onKsRemove($event)">
                </app-ks-info>
              </div>
            </div>

            <div *ngIf="!active" class="w-full h-full flex flex-column">
              <app-dropzone [shouldShorten]="upNext.length > 0"
                            [supportedTypes]="supportedTypes"
                            hintMessage="Supported types: {{supportedTypes.join(', ')}}">
              </app-dropzone>
              <div class="inactive-inbox surface-hover gap-4 border-round-bottom-2xl">
                <div (dragstart)="$event.preventDefault()">
                  <img src="assets/img/kc-icon-greyscale.png"
                       alt="Knowledge Logo"
                       [class.pulsate-fwd]="animate"
                       style="filter: drop-shadow(0 0 1px var(--primary-color)); height: 8rem">
                </div>
                <div class="text-600 text-2xl">
                  You're all caught up.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .inbox-container {
        border-style: hidden;
      }

      @media (min-width: 140rem) {
        .inbox-container {
          border-right-width: 1px !important;
          border-right-style: solid;
          border-left-width: 1px !important;
          border-left-style: solid;
          border-color: var(--surface-200) !important;
        }
      }

      .inactive-inbox {
        height: 100%;
        display: flex;
        flex-direction: column;
        flex-wrap: nowrap;
        align-items: center;
        justify-content: center;
      }
    `
  ]
})
export class HomeComponent implements OnInit, OnDestroy {
  @ViewChild('splitter') splitter!: Splitter;

  upNext: KnowledgeSource[] = [];

  activeIndex: number = 0;

  active?: KnowledgeSource;

  context?: KnowledgeSource;

  filtered?: KnowledgeSource[];

  kcProject: Observable<KcProject | null>;

  treeNodes: TreeNode[] = [];

  selectedProject: any;

  collapsed: boolean = false;

  ksMenuItems: MenuItem[] = [];

  loading: boolean = false;

  supportedTypes: string[] = ["Links", "Files"];

  animate: boolean = true;

  private cleanUp: Subject<any> = new Subject<any>();

  constructor(private confirm: ConfirmationService,
              private dnd: DragAndDropService,
              private factory: KsFactoryService,
              private filterService: FilterService,
              private ingest: IngestService,
              private projects: ProjectService,
              private menu: KsContextMenuService,
              private notifications: NotificationsService,
              private tree: ProjectTreeFactoryService,
              private settings: SettingsService) {
    this.kcProject = projects.currentProject;

    this.supportedTypes = dnd.supportedTypes;

    settings.display.pipe(
      takeUntil(this.cleanUp),
      map(d => d.animations),
      tap(animate => this.animate = animate)
    ).subscribe()

    tree.treeNodes.pipe(
      takeUntil(this.cleanUp),
      tap((nodes) => {
        this.treeNodes = nodes;
      })
    ).subscribe()

    tree.selected.pipe(
      takeUntil(this.cleanUp),
      tap((selected) => {
        this.selectedProject = selected;
      })
    ).subscribe()

    ingest.queue.pipe(
      takeUntil(this.cleanUp),
      tap((upNext) => {
        this.loading = true;
        this.upNext = upNext;

        // Sort messages by date received (most recent appears at the top)
        this.filtered = this.upNext.sort((a, b) => {
          if (a.dateCreated > b.dateCreated) {
            return -1;
          } else if (a.dateCreated < b.dateCreated) {
            return 1;
          } else {
            return 0;
          }
        });
        const activeIndex = this.upNext.findIndex((ks => ks.id.value === this.active?.id.value));
        this.activeIndex = activeIndex === -1 ? 0 : activeIndex;
        this.active = this.upNext[this.activeIndex];
        this.loading = false;
      })
    ).subscribe()
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.cleanUp.next({});
    this.cleanUp.complete();
  }

  @HostListener('document:keydown.Control.[')
  @HostListener('document:keydown.meta.[')
  keyPressPrevious() {
    this.onPreviousSource();
  }

  @HostListener('document:keydown.Control.]')
  @HostListener('document:keydown.meta.]')
  keyPressNext() {
    this.onNextSource();
  }

  onKsRemove($event: KnowledgeSource) {
    this.confirm.confirm({
      message: `Permanently remove ${$event.title}?`,
      header: `Remove Source`,
      acceptLabel: 'Remove',
      rejectLabel: 'Keep',
      acceptButtonStyleClass: 'p-button-text p-button-danger',
      rejectButtonStyleClass: 'p-button-text',
      acceptIcon: 'pi pi-trash',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.ingest.remove($event);
        this.activeIndex = this.activeIndex > 0 ? this.activeIndex - 1 : 0;
      }
    })
  }

  setActive(ks: KnowledgeSource, _?: MouseEvent) {
    const found = this.upNext.indexOf(ks);
    if (found) {
      this.activeIndex = found;
    } else {
      this.activeIndex = 0;
    }
    this.active = this.upNext[this.activeIndex];
  }

  setContext(ks: KnowledgeSource) {
    const found = this.upNext.indexOf(ks);
    let index = found ? found : 0;
    this.context = this.upNext[index];
  }

  onPreviousSource() {
    if (this.activeIndex === 0) {
      this.activeIndex = this.upNext.length - 1;
    } else {
      this.activeIndex = Math.max(0, this.activeIndex - 1);
    }
    this.active = this.upNext[this.activeIndex];
  }

  onNextSource() {
    if (this.activeIndex == this.upNext.length - 1) {
      this.activeIndex = 0;
    } else {
      this.activeIndex = Math.min(this.activeIndex + 1, this.upNext.length - 1);
    }
    this.active = this.upNext[this.activeIndex];
  }

  onProjectImport() {
    if (!this.selectedProject) {
      this.notifications.warn('Inbox', 'Invalid Project', 'You must select a valid project to import.');
      return;
    }

    const project = this.projects.getProject(this.selectedProject.key);
    if (!project) {
      this.notifications.error('Home', 'Invalid Project', 'That project cannot be found in storage.');
      return;
    }

    if (this.active) {
      this.projects.updateProjects([{
        id: project.id,
        addKnowledgeSource: [this.active]
      }]).then((_) => {
        if (this.active) {
          this.ingest.add(this.active);
        }
      })
    }
  }

  expandAll() {
    this.collapsed = true;
    setTimeout(() => {
      this.collapsed = false;
    })
  }

  collapseAll() {
    this.collapsed = false;
    setTimeout(() => {
      this.collapsed = true;
    })
  }

  onKsContextMenu(ks: KnowledgeSource | undefined) {
    if (ks) {
      this.ksMenuItems = this.menu.generate(ks).filter(k => (k.label !== 'Details') && (k.label !== 'Goto Project') && (k.label !== 'Move'));

      let removeItem = this.ksMenuItems.find(k => k.label === 'Remove');

      if (removeItem) {
        removeItem.command = () => {
          this.onKsRemove(ks);
        }
      }
    }
  }

  onFilter($event: Event, value: string) {
    if (value) {
      this.filtered = this.upNext.filter(ks => JSON.stringify(ks).toLocaleLowerCase().includes(value.toLocaleLowerCase()));
    } else {
      this.filtered = this.upNext;
    }
  }

  loadExamples() {
    if (this.loading) {
      return;
    }
    this.loading = true;
    this.factory.examples().pipe(
      take(1),
      tap((ks: { 'title': string, 'accessLink': string, 'topics': string[] }[]) => {
        this.factory.many({
          ingestType: "website",
          links: ks.map(k => k.accessLink)
        }).then((ksList) => {
          ksList.map((k) => {
            k.importMethod = 'example';
            return k;
          })

          if (ksList.length == ks.length) {
            for (let i = 0; i < ksList.length; i++) {
              ksList[i].title = ks[i].title;
              ksList[i].topics = ks[i].topics;
            }
          }

          this.ingest.enqueue(ksList);
          this.loading = false;
        }).catch((error) => {
          setTimeout(() => {
            this.loading = false;
            this.notifications.error('Inbox', 'Unable to Load Examples', 'Please check your connection and try again later...', 'toast');
          }, 1000);
        })
      })
    ).subscribe({
        error: (_: any) => {
          setTimeout(() => {
            this.loading = false;
            this.notifications.error('Inbox', 'Unable to Load Examples', 'Please check your connection and try again later...', 'toast');
          }, 1000);
        }
      }
    )
  }
}
