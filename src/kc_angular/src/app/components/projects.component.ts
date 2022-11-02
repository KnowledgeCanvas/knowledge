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
import {Subscription} from "rxjs";
import {ProjectCommandService} from "../services/command-services/project-command.service";
import {ContextMenu} from "primeng/contextmenu";
import {MenuItem} from "primeng/api";
import {KsCommandService} from "../services/command-services/ks-command.service";
import {KsContextMenuService} from "../services/factory-services/ks-context-menu.service";
import {ProjectContextMenuService} from "../services/factory-services/project-context-menu.service";
import {tap} from "rxjs/operators";
import {KnowledgeSource} from "../models/knowledge.source.model";

@Component({
  selector: 'app-projects',
  template: `
    <div class="w-full h-full flex app-splitter-container surface-section">
      <div class="app-splitter-left">
        <app-projects-tree class="h-full max-h-screen flex flex-column flex-shrink-0 border-right-1 border-200"></app-projects-tree>
      </div>

      <div class="app-splitter-divider"></div>

      <div class="app-splitter-right">
        <graph-canvas #graph
                      [data]="data"
                      (onSourceTap)="onSourceTap($event)"
                      (onSourceCtxtap)="onSourceCtxtap($event)"
                      (onProjectTap)="onProjectTap($event)"
                      (onProjectCtxtap)="onProjectCtxtap($event)"
                      class="w-full h-full">
        </graph-canvas>
      </div>
    </div>

    <p-contextMenu #cm
                   styleClass="shadow-7"
                   [model]="menuItems"
                   [baseZIndex]="999999"
                   [autoZIndex]="true"
                   appendTo="body">
    </p-contextMenu>
  `,
  styles: []
})
export class ProjectsComponent implements OnInit, OnDestroy {
  @ViewChild('cm') cm!: ContextMenu;

  projectId: string = '';

  kcProject: KcProject | null = null;

  routeSub: Subscription;

  data: any[] = [];

  menuItems: MenuItem[] = [];

  constructor(private route: ActivatedRoute,
              private projects: ProjectService,
              private command: KsCommandService,
              private context: KsContextMenuService,
              private pContext: ProjectContextMenuService,
              private pCommand: ProjectCommandService) {

    this.routeSub = route.params.subscribe((params) => {
      this.projectId = params.projectId ?? '';

      this.kcProject = projects.getProject(this.projectId) ?? null;

      if (this.projectId !== projects.getCurrentProjectId()?.value) {
        this.projects.setCurrentProject(this.projectId);
      }

      this.data = [];
      this.build();
    });

    this.projects.currentProject.pipe(tap(this.build)).subscribe()
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.routeSub.unsubscribe();
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
          project: project
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
    }

    this.data = data;
  }

  private getTree(project: string | any): KcProject[] {
    if (!project) {
      return [];
    }

    if (typeof project === 'string') {
      let p = this.projects.getProject(project);
      if (!p) {
        return [];
      } else {
        project = p;
      }
    }

    let tree = [project];
    if (!project.subprojects) {
      return tree;
    }
    for (let subProject of project.subprojects) {
      tree = tree.concat(this.getTree(subProject));
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
