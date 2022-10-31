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
import {Subscription} from "rxjs";
import {ProjectContextMenuService} from "../../services/factory-services/project-context-menu.service";

@Component({
  selector: 'app-projects-tree',
  template: `
    <p-tree class="h-full"
            styleClass="surface-ground"
            [style]="{'max-height': '100%'}"
            [contextMenu]="cm"
            (onNodeContextMenuSelect)="onContextMenu($event)"
            [filter]="true"
            [value]="projectTree"
            [(selection)]="currentProject"
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
                  (click)="onRemoveProject(currentProject)"
                  class="p-button-text p-button-plain p-button-danger">
          </button>
        </div>
      </ng-template>

      <ng-template pTemplate="footer">
        <div class="flex-row-center-between border-top-1 border-400">
          <button pButton
                  icon="pi pi-arrow-down"
                  label="Expand All"
                  (click)="expandAll(projectTree, true)"
                  class="p-button-text p-button-plain">
          </button>
          <button pButton
                  icon="pi pi-arrow-up"
                  label="Collapse All"
                  (click)="expandAll(projectTree, false)"
                  class="p-button-text p-button-plain">
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

  projectTreeSub: Subscription;

  projectSub: Subscription;

  constructor(private projects: ProjectService,
              private pCommand: ProjectCommandService,
              private pContext: ProjectContextMenuService,
              private tree: ProjectTreeFactoryService) {
    const expandPath = (node: TreeNode) => {
      let curr = node.parent;
      while (curr) {
        curr.expanded = true;
        curr = curr.parent;
      }
    }

    this.projectTreeSub = projects.projectTree.subscribe((projectTree) => {
      this.projectTree = tree.constructTreeNodes(projectTree, true) ?? [];
      if (this.projectTree.length > 0) {
        this.currentProject = tree.findTreeNode(this.projectTree, this.projectId) ?? undefined;
        if (this.currentProject) {
          expandPath(this.currentProject);
        }
      }
    })

    this.projectSub = this.projects.currentProject.subscribe((project) => {
      if (project) {
        this.projectId = project.id.value;
      }
      if (this.projectTree.length > 0) {
        this.currentProject = tree.findTreeNode(this.projectTree, this.projectId) ?? undefined;
        if (this.currentProject) {
          expandPath(this.currentProject);
        }
      }
    })
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.projectTreeSub.unsubscribe();
    this.projectSub.unsubscribe();
  }

  selectionChange($event: any) {
    this.projects.setCurrentProject($event.key);
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
}
