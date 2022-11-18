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
import {ProjectService} from "../../services/factory-services/project.service";
import {MenuItem, TreeNode} from "primeng/api";
import {TreeModule} from "primeng/tree";
import {ProjectCommandService} from "../../services/command-services/project-command.service";
import {ProjectTreeFactoryService} from "../../services/factory-services/project-tree-factory.service";
import {BehaviorSubject, skip, Subject, tap} from "rxjs";
import {ProjectContextMenuService} from "../../services/factory-services/project-context-menu.service";
import {debounceTime, takeUntil} from "rxjs/operators";

@Component({
  selector: 'app-projects-tree',
  template: `
    <p-tree class="h-full"
            [style]="{'max-height': '100%'}"
            [contextMenu]="cm"
            (onNodeContextMenuSelect)="onContextMenu($event)"
            [filter]="true"
            [value]="projectTree"
            [selection]="currentProject"
            emptyMessage=" "
            selectionMode="single"
            (selectionChange)="selectionChange($event)"
            scrollHeight="flex">
      <ng-template pTemplate="header">
        <div class="flex-row-center-between">
          <button pButton
                  icon="pi pi-plus"
                  label="Project"
                  (click)="onNewProject()"
                  class="p-button-text p-button-plain">
          </button>
          <button pButton
                  icon="pi pi-trash"
                  label="Remove"
                  [disabled]="!projectTree"
                  (click)="onRemoveProject(currentProject)"
                  class="p-button-text p-button-plain p-button-danger">
          </button>
        </div>
      </ng-template>

      <ng-template pTemplate="footer">
        <div class="flex-row-center-between border-top-1 border-400">
          <button pButton
                  icon="pi pi-arrow-down"
                  label="Expand"
                  [disabled]="!projectTree || projectTree.length === 0"
                  (click)="expandAll(projectTree, true)"
                  class="p-button-text p-button-plain outline-none border-none shadow-none">
          </button>
          <button pButton
                  icon="pi pi-circle"
                  class="p-button-text border-none outline-none shadow-none"
                  [disabled]="!projectTree || projectTree.length === 0"
                  pTooltip="Show current project"
                  tooltipPosition="top"
                  (click)="showSelected()">
          </button>
          <button pButton
                  icon="pi pi-arrow-up"
                  label="Collapse"
                  [disabled]="!projectTree || projectTree.length === 0"
                  (click)="expandAll(projectTree, false)"
                  class="p-button-text p-button-plain outline-none border-none shadow-none">
          </button>
        </div>
      </ng-template>
    </p-tree>
    <p-contextMenu #cm [model]="menu" appendTo="body"></p-contextMenu>
  `,
  styles: [
    `
      ::ng-deep {
        .p-tree {
          height: 100%;
          border: none;
        }
      }
    `
  ]
})
export class ProjectsTreeComponent implements OnInit, OnDestroy {
  @ViewChild('tree') pTree!: TreeModule;

  projectId: string = '';

  currentProject?: TreeNode;

  projectTree: TreeNode[] = [];

  menu: MenuItem[] = [];

  projectChange = new BehaviorSubject<string>('');

  private cleanUp: Subject<any> = new Subject<any>();

  constructor(private projects: ProjectService,
              private pCommand: ProjectCommandService,
              private pContext: ProjectContextMenuService,
              private tree: ProjectTreeFactoryService) {
    this.projectChange.asObservable().pipe(
      takeUntil(this.cleanUp),
      skip(1),
      debounceTime(500),
      tap((projectId) => {
        this.projects.setCurrentProject(projectId);
      })
    ).subscribe()

    tree.treeNodes.pipe(
      takeUntil(this.cleanUp),
      tap((nodes) => {
        this.projectTree = nodes;
        if (this.projectTree.length > 0) {
          this.currentProject = tree.findTreeNode(this.projectTree, this.projectId) ?? undefined;
          if (this.currentProject) {
            this.expandPath(this.currentProject);
          }
        }
      })
    ).subscribe()

    projects.currentProject.pipe(
      takeUntil(this.cleanUp),
      tap((project) => {
        if (project) {
          this.projectId = project.id.value;
        }
        if (this.projectTree.length > 0) {
          this.currentProject = tree.findTreeNode(this.projectTree, this.projectId) ?? undefined;
          if (this.currentProject) {
            this.expandPath(this.currentProject);
          }
        }
      })
    ).subscribe()
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.cleanUp.next({});
    this.cleanUp.complete();
  }

  private expandPath = (node: TreeNode) => {
    let curr = node.parent;
    while (curr) {
      curr.expanded = true;
      curr = curr.parent;
    }
  }

  selectionChange($event: any) {
    this.projectChange.next($event.key);
  }

  onNewProject(currentProject?: TreeNode) {
    if (currentProject?.key) {
      this.pCommand.new({value: currentProject.key});
    } else {
      this.pCommand.new();
    }
  }

  onRemoveProject(currentProject?: TreeNode) {
    if (currentProject?.key) {
      const project = this.projects.getProject(currentProject.key);
      if (project) {
        this.pCommand.remove([project]);
      }
    }
  }

  expandAll = (root: TreeNode[], expand: boolean) => {
    for (let t of root) {
      t.expanded = expand;
      if (t.children && t.children.length > 0)
        this.expandAll(t.children, expand)
    }
  }

  onContextMenu($event: any) {
    if ($event.node) {
      const project = this.projects.getProject($event.node.key);

      if (project) {
        this.menu = this.pContext.generate(project);
      }
    } else {
      this.menu = [];
    }
  }

  showSelected() {
    if (this.currentProject) {
      this.expandAll(this.projectTree, false);
      this.expandPath(this.currentProject);
    }
  }
}
