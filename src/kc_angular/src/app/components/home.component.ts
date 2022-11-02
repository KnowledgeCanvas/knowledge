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
import {KsFactoryService} from "../services/factory-services/ks-factory.service";
import {take} from "rxjs/operators";
import {DragAndDropService} from "../services/ingest-services/drag-and-drop.service";

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
    <div class="w-full h-full flex app-splitter-container surface-section">
      <div class="app-splitter-left">
        <div *ngIf="upNext.length > 0" class="h-full" style="overflow-y: auto">
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
                            (click)="setActive(ks)"
                            (contextmenu)="setContext(ks); onKsContextMenu(context); cm.show($event)"
                            [class.bg-primary-reverse]="active && (ks.id.value === (active.id.value))"
                            [class.surface-ground]="active && (ks.id.value === (active.id.value))">
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

      <div class="app-splitter-divider"></div>

      <div class="app-splitter-right">
        <div *ngIf="active" class="w-full h-full flex flex-column">
          <div class="flex flex-row justify-content-between align-items-center p-2">
            <div class="flex flex-row">
              <button pButton
                      icon="pi pi-arrow-down"
                      label="Expand"
                      (click)="expandAll()"
                      class="p-button-rounded p-button-text shadow-none"></button>
              <button pButton
                      icon="pi pi-arrow-up"
                      label="Collapse"
                      (click)="collapseAll()"
                      class="p-button-rounded p-button-text shadow-none"></button>
            </div>

            <div *ngIf="treeNodes.length > 0" class="flex flex-row">
              <div class="" *ngIf="selectedProject">
                <button pButton icon="pi pi-fw pi-times" (click)="selectedProject = undefined" class="p-button-text p-button-plain"></button>
              </div>
              <p-treeSelect [options]="treeNodes"
                            [(ngModel)]="selectedProject"
                            class="text-primary"
                            selectionMode="single"
                            placeholder="Choose a project"
                            [filter]="true"
                            appendTo="body">
              </p-treeSelect>
              <button pButton
                      class="ml-1"
                      label="Import"
                      [disabled]="!selectedProject"
                      (click)="onProjectImport()"></button>
            </div>

            <div *ngIf="treeNodes.length === 0" class="">
              <input pInputText #projectName placeholder="Create a new Project">
              <button pButton
                      class="ml-1"
                      label="Create and Import"
                      [disabled]="!projectName.value"
                      (click)="onProjectCreateAndImport(projectName.value)"></button>
            </div>
          </div>
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
          <div class="inactive-inbox gap-4">
            <div (dragstart)="$event.preventDefault()">
              <img src="assets/img/kc-icon-greyscale.png"
                   alt="Knowledge Logo"
                   class="pulsate-fwd"
                   style="filter: drop-shadow(0 0 1px var(--primary-color)); height: 8rem">
            </div>
            <div class="text-600 text-2xl">
              You're all caught up.
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .inactive-inbox {
        flex-basis: 75%;
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

  sub1: Subscription;

  sub2: Subscription;

  ksMenuItems: MenuItem[] = [];

  loading: boolean = false;

  supportedTypes: string[] = ["Links", "Files"];

  constructor(private confirm: ConfirmationService,
              private dnd: DragAndDropService,
              private factory: KsFactoryService,
              private filterService: FilterService,
              private ingest: IngestService,
              private projects: ProjectService,
              private menu: KsContextMenuService,
              private notifications: NotificationsService,
              private tree: ProjectTreeFactoryService) {
    this.kcProject = projects.currentProject;

    this.supportedTypes = dnd.supportedTypes;

    this.sub1 = projects.projectTree.subscribe((projectTree) => {
      this.treeNodes = tree.constructTreeNodes(projectTree, false);
    })

    this.sub2 = ingest.queue.subscribe((upNext) => {
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

  loadExamples() {
    if (this.loading) {
      return;
    }
    this.loading = true;
    this.factory.examples()
      .pipe(
        take(1)
      )
      .subscribe((ks: { "title": string, "accessLink": string }[]) => {
        this.factory.many({
          ingestType: "website",
          links: ks.map(k => k.accessLink)
        }).then((ksList) => {
          ksList.map((ks) => {
            ks.importMethod = 'example';
            return ks;
          })
          this.ingest.enqueue(ksList);
          this.loading = false;
        })
      }, (_: any) => {
        setTimeout(() => {
          this.loading = false;
          this.notifications.error('Inbox', 'Unable to Load Examples', 'Please check your connection and try again later...', 'toast');
        }, Math.floor(Math.random() * 1000));
      })
  }
}
