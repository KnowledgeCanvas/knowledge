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
import {Component, OnDestroy, OnInit} from '@angular/core';
import {ProjectService} from "../../services/factory-services/project.service";
import {MenuItem, TreeNode} from "primeng/api";
import {ProjectCommandService} from "../../services/command-services/project-command.service";
import {ProjectTreeFactoryService} from "../../services/factory-services/project-tree-factory.service";
import {BehaviorSubject, merge, skip, Subject, tap} from "rxjs";
import {ProjectContextMenuService} from "../../services/factory-services/project-context-menu.service";
import {debounceTime, takeUntil} from "rxjs/operators";
import {NotificationsService} from "../../services/user-services/notifications.service";

@Component({
  selector: 'app-projects-tree',
  template: `
    <p-tree class="h-full"
            emptyMessage=" "
            selectionMode="single"
            scrollHeight="flex"
            [style]="{'max-height': '100%'}"
            [contextMenu]="cm"
            [filter]="true"
            [value]="projectTree"
            [selection]="currentProject"
            (selectionChange)="selectionChange($event)"
            (onNodeContextMenuSelect)="onContextMenu($event)"
            (onNodeCollapse)="onNodeCollapse($event, true)"
            (onNodeExpand)="onNodeCollapse($event, false)">
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
  projectId: string = '';

  currentProject?: TreeNode;

  projectTree: TreeNode[] = [];

  menu: MenuItem[] = [];

  private projectChange = new BehaviorSubject<string>('');

  private cleanUp: Subject<any> = new Subject<any>();

  constructor(private notifications: NotificationsService,
              private projects: ProjectService,
              private pCommand: ProjectCommandService,
              private pContext: ProjectContextMenuService,
              private tree: ProjectTreeFactoryService) {
    /* When user selects a project in the project tree, set current project via project service */
    this.projectChange.asObservable().pipe(
      takeUntil(this.cleanUp),
      skip(1),
      debounceTime(500),
      tap((projectId) => {
        this.projects.setCurrentProject(projectId);
      })
    ).subscribe()

    /* When the project tree is updated, make sure the correct project is selected in the tree */
    const treeSub$ = tree.treeNodes.pipe(
      takeUntil(this.cleanUp),
      tap((nodes) => {
        this.projectTree = nodes;
      })
    )

    /* When the current project changes, make sure the correct project is selected in the tree */
    const projectSub$ = projects.currentProject.pipe(
      takeUntil(this.cleanUp),
      tap((project) => {
        this.projectId = project?.id.value ?? this.projectId;
      })
    )

    merge(treeSub$, projectSub$).pipe(
      takeUntil(this.cleanUp),
      debounceTime(500),
      tap(() => {
        if (this.projectTree.length > 0) {
          this.notifications.debug('Project Tree', 'Setting Active Project', `${this.projectId}`);
          this.currentProject = tree.findTreeNode(this.projectId, this.projectTree) ?? undefined;
          if (this.currentProject) {
            this.expandPath(this.currentProject);
            this.scrollToActive();
          }
        }
      })
    ).subscribe()
  }

  ngOnInit(): void {
    this.scrollToActive(1000);
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
    this.pCommand.new(currentProject?.key ? {value: currentProject.key} : undefined);
  }

  onRemoveProject(currentProject?: TreeNode) {
    if (currentProject?.key) {
      const project = this.projects.getProject(currentProject.key);
      if (project) {
        this.pCommand.remove([project]);
      }
    }
  }

  expandAll = async (root: TreeNode[], expand: boolean) => {
    for (let t of root) {
      t.expanded = expand;
      if (t.children && t.children.length > 0)
        await this.expandAll(t.children, expand)
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

  scrollToActive(timeout: number = 0) {
    setTimeout(() => {
      const classElement = document.getElementsByClassName('p-treenode-content p-treenode-selectable p-highlight');
      if (classElement.length > 0) {
        classElement[0].scrollIntoView();
      }
    }, timeout)
  }

  showSelected() {
    if (this.currentProject) {
      this.expandPath(this.currentProject);
      this.scrollToActive();
    }
  }

  onNodeCollapse($event: any, collapsed: boolean) {
    const node = $event.node;
    if (node?.key) {
      let project = this.projects.getProject(node.key)
      if (project) {
        this.projects.updateProjects([{
          id: project.id,
          expanded: !collapsed
        }])
      }
    }
  }
}
