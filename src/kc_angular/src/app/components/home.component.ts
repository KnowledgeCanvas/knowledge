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
import {Component, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {KnowledgeSource} from "../models/knowledge.source.model";
import {IngestService} from "../services/ingest-services/ingest.service";
import {ProjectService} from "../services/factory-services/project.service";
import {Observable, Subscription} from "rxjs";
import {KcProject, ProjectCreationRequest} from "../models/project.model";
import {ProjectTreeFactoryService} from "../services/factory-services/project-tree-factory.service";
import {ConfirmationService, FilterService, MenuItem, TreeNode} from "primeng/api";
import {NotificationsService} from "../services/user-services/notifications.service";
import {KsContextMenuService} from "../services/factory-services/ks-context-menu.service";
import {Splitter} from "primeng/splitter";

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
    <div class="h-full w-full flex-col-center-center">
      <div class="w-full h-full flex-col-center-between surface-section p-4" [style]="{'max-width': 'min(100%, 150rem)'}">
        <div *ngIf="upNext.length === 0" class="w-full flex flex-row flex-shrink-1 mb-2">
          <app-ks-ingest class="w-full border-1 border-300 border-round p-4 surface-section select-none"
                         [ksList]="upNext"
                         [currentProject]="kcProject | async">
          </app-ks-ingest>
        </div>

        <div *ngIf="upNext.length > 0" class="w-full flex flex-row flex-shrink-1">
          <div class="col-3">
            <div class="p-input-icon-left w-full">
              <i class="pi pi-filter"></i>
              <input type="text"
                     pInputText
                     #filter
                     (input)="onFilter($event, filter.value)"
                     class="w-full p-fluid">
            </div>
          </div>
          <div class="col-3"></div>
          <div class="col-3"></div>
          <div class="col-3"></div>
        </div>


        <div class="w-full flex flex-row flex-grow-1 border-round border-1 border-300">
          <p-splitter *ngIf="active"
                      #splitter
                      [panelSizes]="[leftPanelSize,rightPanelSize]"
                      [minSizes]="[leftPanelMinSize, rightPanelMinSize]"
                      stateKey="inboxSplitterPanel"
                      stateStorage="local"
                      styleClass="h-full">
            <ng-template pTemplate>
              <div class="w-full h-full inbox-side-panel" id="inbox-side-panel" #inboxSidePanel>
                <div style="height: inherit; overflow-y: auto">
                  <app-ks-message *ngFor="let ks of filtered"
                                  [ks]="ks"
                                  (click)="setActive(ks)"
                                  (contextmenu)="setContext(ks); onKsContextMenu(context); cm.show($event)"
                                  [class.bg-primary-reverse]="ks.id.value === active.id.value"
                                  [class.surface-ground]="ks.id.value === active.id.value"
                                  class="flex flex-row border-round-left w-full cursor-pointer overflow-hidden text-overflow-ellipsis">
                  </app-ks-message>
                </div>
              </div>
            </ng-template>

            <ng-template pTemplate>
              <div class="flex flex-col flex-auto border-left-1 border-400 surface-section">
                <div class="flex-col-center-start">
                  <div class="w-full flex-row-center-between surface-ground mb-4 py-2 border-bottom-1 border-300">
                    <div class="flex-row-center-start">
                      <button pButton
                              icon="pi pi-arrow-down"
                              label="Expand All"
                              (click)="expandAll()"
                              class="p-button-rounded p-button-text shadow-none"></button>
                      <button pButton
                              icon="pi pi-arrow-up"
                              label="Collapse All"
                              (click)="collapseAll()"
                              class="p-button-rounded p-button-text shadow-none"></button>
                    </div>
                    <div *ngIf="treeNodes.length > 0" class="pr-3 flex-row-center-end">
                      <div class="" *ngIf="selectedProject">
                        <button pButton icon="pi pi-fw pi-times" (click)="selectedProject = undefined" class="p-button-text p-button-plain"></button>
                      </div>
                      <p-treeSelect [options]="treeNodes"
                                    [(ngModel)]="selectedProject"
                                    class="text-primary"
                                    selectionMode="single"
                                    placeholder="Select a project"
                                    [filter]="true"
                                    appendTo="body">
                      </p-treeSelect>
                      <button pButton
                              class="ml-1"
                              label="Import"
                              [disabled]="!selectedProject"
                              (click)="onProjectImport()"></button>
                    </div>
                    <div *ngIf="treeNodes.length === 0" class="pr-3 flex-row-center-end">
                      <input pInputText #projectName placeholder="Create a new Project">
                      <button pButton
                              class="ml-1"
                              label="Create and Import"
                              [disabled]="!projectName.value"
                              (click)="onProjectCreateAndImport(projectName.value)"></button>
                    </div>
                  </div>
                  <div class="h-full w-full px-4 border-bottom-1 border-300" style="max-height: calc(100vh - 48px - 36px - 32px - 116px);">
                    <p-scrollPanel styleClass="w-full h-full">
                      <app-ks-info *ngIf="active"
                                   [ks]="active"
                                   [collapseAll]="collapsed"
                                   (onRemove)="onKsRemove($event)">
                      </app-ks-info>
                    </p-scrollPanel>
                  </div>
                </div>
              </div>
            </ng-template>
          </p-splitter>

          <div *ngIf="!active" class="h-full w-full flex-row-center-center surface-section select-none border-round-bottom" style="height: 20rem">
            <div class="h-full flex-col-center-center">
              <div (dragstart)="$event.preventDefault()">
                <img src="assets/img/kc-icon-greyscale.png"
                     alt="Knowledge Logo"
                     class="pulsate-fwd"
                     style="filter: drop-shadow(0 0 1px var(--primary-color)); height: 8rem">
              </div>
              <div class="text-2xl text-600 mt-4">
                You're all caught up.
              </div>
              <div class="text-400">
                Imported sources will appear here as soon as they are ready
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .inbox-side-panel {
        overflow: hidden;
        max-height: calc(100vh - 48px - 32px - 36px - 52px);
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

  sub1: Subscription;

  sub2: Subscription;

  ksMenuItems: MenuItem[] = [];

  leftPanelSize: number = 20;

  rightPanelSize: number = 80;

  leftPanelMinSize: number = 15;

  rightPanelMinSize: number = 65;

  constructor(private confirm: ConfirmationService,
              private filterService: FilterService,
              private ingest: IngestService,
              private projects: ProjectService,
              private menu: KsContextMenuService,
              private notifications: NotificationsService,
              private tree: ProjectTreeFactoryService) {
    this.kcProject = projects.currentProject;

    this.sub1 = projects.projectTree.subscribe((projectTree) => {
      this.treeNodes = tree.constructTreeNodes(projectTree, false);
    })

    this.sub2 = ingest.queue.subscribe((upNext) => {
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
    })
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.sub1.unsubscribe();
    this.sub2.unsubscribe();
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

  setActive(ks: KnowledgeSource) {
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
      this.notifications.warn('Home', 'Invalid Project', 'You must select a valid project to import.');
      return;
    }

    const project = this.projects.getProject(this.selectedProject.key);
    if (!project) {
      this.notifications.error('Home', 'Invalid Project', 'That project cannot be found in storage.');
      return;
    }

    if (this.active) {
      project.knowledgeSource.push(this.active);
      this.projects.updateProjects([{id: project.id}]).then((_) => {
        if (this.active) {
          this.ingest.add(this.active);
        }
      })
    }
  }

  /**
   * Create a new project and then import the selected source
   * This function is only used when there are no existing projects
   * @param projectName
   */
  onProjectCreateAndImport(projectName: string) {
    console.log('Creating project with name: ', projectName);
    let req: ProjectCreationRequest = {
      calendar: {
        events: [],
        end: null,
        start: null
      },
      sources: [],
      authors: [],
      description: "",
      knowledgeSource: [],
      name: projectName,
      subProjects: [],
      topics: [],
      type: 'default',
      parentId: {value: ''}
    }
    this.projects.newProject(req).then((_: any) => {
      this.selectedProject = this.treeNodes[0];
      this.onProjectImport();
    })
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
}
