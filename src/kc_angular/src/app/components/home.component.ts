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
import {Component, OnDestroy, OnInit} from '@angular/core';
import {KnowledgeSource} from "../models/knowledge.source.model";
import {IngestService} from "../services/ingest-services/ingest.service";
import {ProjectService} from "../services/factory-services/project.service";
import {Observable, Subscription} from "rxjs";
import {KcProject} from "../models/project.model";
import {ProjectTreeFactoryService} from "../services/factory-services/project-tree-factory.service";
import {ConfirmationService, TreeNode} from "primeng/api";
import {NotificationsService} from "../services/user-services/notifications.service";

@Component({
  selector: 'app-home',
  template: `
    <div class="h-full w-full flex-col-center-center">
      <div class="w-full h-full flex-col-center-between surface-section p-4" [style]="{'max-width': 'min(100%, 150rem)'}">
        <div class="w-full flex flex-row flex-shrink-1 mb-2">
          <app-ks-ingest class="w-full border-1 border-300 border-round p-4 surface-section select-none"
                         [ksList]="upNext"
                         [currentProject]="kcProject | async">
          </app-ks-ingest>
        </div>
        <div class="w-full flex flex-row flex-grow-1 border-round border-1 border-300">
          <div class="flex flex-column flex-auto surface-ground">
            <div class="pt-7 flex-col-center-start overflow-y-auto overflow-x-hidden"
                 style="max-height: calc(100vh - 25rem)">
              <div *ngFor="let ks of upNext"
                   [class.border-right-2]="ks.id.value === active?.id?.value"
                   [class.border-primary]="ks.id.value === active?.id?.value"
                   [pTooltip]="ks.title"
                   class="flex-row-center-center border-round-left">
                <app-ks-icon [ks]="ks"
                             (click)="setActive(ks)"
                             class="p-2 cursor-pointer">
                </app-ks-icon>
              </div>
            </div>
          </div>

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

          <div *ngIf="active" class="flex flex-col flex-auto border-left-1 border-400 surface-section">
            <div class="flex-col-center-start">
              <div class="w-full flex-row-center-between mb-4 py-2 border-bottom-1 border-300">
                <div>
                  <button pButton icon="pi pi-arrow-left" [disabled]="upNext.length <= 1" class="p-button-rounded p-button-text" (click)="onLeftClick($event)"></button>
                  <button pButton icon="pi pi-arrow-right" [disabled]="upNext.length <= 1" class="p-button-rounded p-button-text" (click)="onRightClick($event)"></button>
                </div>
                <div class="pr-3 flex-row-center-end">
                  <div class="text-primary pr-3" *ngIf="!selectedProject">
                    Select a project:
                  </div>
                  <div class="" *ngIf="selectedProject">
                    <button pButton icon="pi pi-fw pi-times" (click)="selectedProject = undefined" class="p-button-text p-button-plain"></button>
                  </div>
                  <p-treeSelect [options]="treeNodes"
                                [(ngModel)]="selectedProject"
                                class="text-primary"
                                selectionMode="single"
                                [filter]="true"
                                appendTo="body">
                  </p-treeSelect>
                  <button pButton
                          class="ml-1"
                          label="Import"
                          [disabled]="!selectedProject"
                          (click)="onProjectImport($event)"></button>
                </div>
                <div class="flex-row-center-center">
                  <div class="flex-row-center-center" style="width: 100%">
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
                </div>
              </div>
              <div class="h-full w-full px-4" style="max-height: calc(100vh - 24rem)">
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
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .pulsate-fwd {
        -webkit-animation: pulsate-fwd 3s ease-in-out infinite forwards;
        animation: pulsate-fwd 3s ease-in-out infinite forwards;
      }

      @-webkit-keyframes pulsate-fwd {
        0% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.1);
        }
        100% {
          transform: scale(1);
        }
      }

      @keyframes pulsate-fwd {
        0% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.1);
        }
        100% {
          transform: scale(1);
        }
      }
    `
  ]
})
export class HomeComponent implements OnInit, OnDestroy {
  upNext: KnowledgeSource[] = [];

  activeIndex: number = 0;

  active?: KnowledgeSource;

  kcProject: Observable<KcProject | null>;

  treeNodes: TreeNode[] = [];

  selectedProject: any;

  collapsed: boolean = false;

  sub1: Subscription;

  sub2: Subscription;

  constructor(private confirm: ConfirmationService,
              private ingest: IngestService,
              private projects: ProjectService,
              private notifications: NotificationsService,
              private tree: ProjectTreeFactoryService) {
    this.kcProject = projects.currentProject;

    this.sub1 = projects.projectTree.subscribe((projectTree) => {
      this.treeNodes = tree.constructTreeNodes(projectTree, false);
    })

    this.sub2 = ingest.queue.subscribe((upNext) => {
      this.upNext = upNext;
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

  onLeftClick(_: MouseEvent) {
    if (this.activeIndex === 0) {
      this.activeIndex = this.upNext.length - 1;
    } else {
      this.activeIndex = Math.max(0, this.activeIndex - 1);
    }
    this.active = this.upNext[this.activeIndex];
  }

  onRightClick(_: MouseEvent) {
    if (this.activeIndex == this.upNext.length - 1) {
      this.activeIndex = 0;
    } else {
      this.activeIndex = Math.min(this.activeIndex + 1, this.upNext.length - 1);
    }
    this.active = this.upNext[this.activeIndex];
  }

  onProjectImport(_: MouseEvent) {
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
}
