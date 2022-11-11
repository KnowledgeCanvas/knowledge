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

import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {ProjectService} from "../services/factory-services/project.service";
import {KcProject} from "../models/project.model";
import {Subject, Subscription} from "rxjs";
import {KsContextMenuService} from "../services/factory-services/ks-context-menu.service";
import {KnowledgeSource} from "../models/knowledge.source.model";
import {KsCommandService} from "../services/command-services/ks-command.service";
import {ConfirmationService, MenuItem} from "primeng/api";
import {ContextMenu} from "primeng/contextmenu";
import {ProjectCommandService} from "../services/command-services/project-command.service";
import {takeUntil, tap} from "rxjs/operators";
import {ProjectContextMenuService} from "../services/factory-services/project-context-menu.service";
import {SettingsService} from "../services/ipc-services/settings.service";


@Component({
  selector: 'app-graph',
  template: `
    <div class="graph-container">
      <p-splitter [minSizes]="[15, 65]"
                  [panelSizes]="[20, 80]"
                  class="w-full"
                  styleClass="w-full h-full">
        <ng-template pTemplate="content">
          <div class="graph-left">
            <app-projects-tree></app-projects-tree>
          </div>
        </ng-template>

        <ng-template pTemplate="content">
          <div class="graph-right">
            <graph-canvas #graph
                          [data]="data"
                          (onSourceTap)="onSourceTap($event)"
                          (onSourceCtxtap)="onSourceCtxtap($event)"
                          (onProjectTap)="onProjectTap($event)"
                          (onProjectCtxtap)="onProjectCtxtap($event)"
                          class="w-full h-full">
            </graph-canvas>
          </div>
        </ng-template>
      </p-splitter>
    </div>

    <p-contextMenu #cm
                   styleClass="shadow-7"
                   [model]="menuItems"
                   [baseZIndex]="999999"
                   [autoZIndex]="true"
                   appendTo="body">
    </p-contextMenu>
  `,
  styles: [
    `
      .graph-container {
        height: 100%;
        width: 100%;
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        justify-content: space-between;

        .graph-left {
          height: 100%;
          width: 100%;
        }

        .graph-right {
          height: 100%;
          width: 100%;
          display: flex;
          flex-direction: column;
          flex-wrap: nowrap;
        }
      }
    `
  ]
})
export class GraphComponent implements OnInit, OnDestroy {
  @ViewChild('cm') cm!: ContextMenu;

  projectId: string = '';

  routeSub?: Subscription;

  data: any[] = [];

  menuItems: MenuItem[] = [];

  private activeProject?: KcProject;

  private showSources: boolean = true;

  private running: boolean = false;

  private cleanUp = new Subject();

  constructor(private route: ActivatedRoute,
              private projects: ProjectService,
              private command: KsCommandService,
              private context: KsContextMenuService,
              private pContext: ProjectContextMenuService,
              private pCommand: ProjectCommandService) {
  }

  ngOnInit(): void {
    this.route.params.pipe(
      takeUntil(this.cleanUp),
      tap((params) => {
        this.projectId = params.projectId ?? '';
        if (this.projectId !== this.projects.getCurrentProjectId()?.value) {
          this.projects.setCurrentProject(this.projectId);
        }
        this.data = [];
        this.build();
      })
    ).subscribe();

    this.projects.currentProject.pipe(
      takeUntil(this.cleanUp),
      tap((project) => {
        if (!this.activeProject && project) {
          this.build();
        } else if (this.activeProject && project) {
          if (this.activeProject.id.value !== project.id.value
            || this.activeProject.knowledgeSource.length !== project.knowledgeSource.length
            || this.activeProject.subprojects.length !== project.subprojects.length) {
            this.build();
          }
        }
        this.activeProject = project ?? undefined;
      })
    ).subscribe()

    this.settings.graph.pipe(
      takeUntil(this.cleanUp),
      tap((graphSettings) => {
        this.showSources = graphSettings.display.showSources;
        this.data = [];
        this.build();
      })
    ).subscribe()
  }

  ngOnDestroy() {
    this.cleanUp.next({});
    this.cleanUp.complete();
  }

  build() {
    if (!this.projectId) {
      return;
    }

    const projectTree = this.getTree(this.projectId);
    let data: any[] = [];

    for (let project of projectTree) {
      data.push({
        group: 'nodes',
        data: {
          id: project.id.value,
          label: project.name,
          type: project.id.value === this.projectId ? 'root' : 'project',
          project: project,
          width: (64 / Math.pow(project.level, 1 / 2)) + 4,
          height: 64 / Math.pow(project.level, 1 / 2),
          level: project.level
        }
      });

      for (let sub of project.subprojects) {
        let edge = {
          group: 'edges',
          data: {
            id: `${project.id.value}-${sub}`,
            source: project.id.value,
            target: sub
          }
        }
        data.push(edge);
      }

      for (let ks of project.knowledgeSource) {
        ks.icon = localStorage.getItem(`icon-${ks.id.value}`);
        data.push({
          group: 'nodes',
          data: {
            id: ks.id.value,
            label: ks.title,
            type: 'ks',
            ks: ks,
            icon: ks.icon,
            // parent: project.id.value
          }
        })

        data.push({
          group: 'edges',
          data: {
            id: `${project.id.value}-${ks.id.value}`,
            source: project.id.value,
            target: ks.id.value
          }
        })
      }
    }

    this.data = data;
  }

  private getTree(project: string | any, level: number = 1): (KcProject & { level: number })[] {
    if (!project) {
      return [];
    }

    if (typeof project === 'string') {
      let p = this.projects.getProject(project);
      if (!p) {
        return [];
      } else {
        project = p;
        project.level = level;
      }
    }

    let tree = [project];
    if (!project.subprojects) {
      return tree;
    }
    for (let subProject of project.subprojects) {
      tree = tree.concat(this.getTree(subProject, level + 1));
    }

    return tree;
  }

  onSourceTap($event: { data: KnowledgeSource; event: MouseEvent }) {
    this.command.detail($event.data);
  }

  onSourceCtxtap($event: { data: KnowledgeSource; event: MouseEvent }) {
    this.menuItems = this.context.generate($event.data)
    this.cm.show($event.event);
  }

  onProjectCtxtap($event: { data: KcProject; event: MouseEvent }) {
    this.menuItems = this.pContext.generate($event.data);
    this.cm.show($event.event);
  }

  onProjectTap($event: { data: KcProject; event: MouseEvent }) {
    console.log('project tap: ', $event);
    this.pCommand.detail($event.data);
  }
}
