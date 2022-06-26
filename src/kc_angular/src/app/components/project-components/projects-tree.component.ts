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

import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {ProjectService} from "../../services/factory-services/project.service";
import {ProjectUpdateRequest} from "src/app/models/project.model";
import {PrimeIcons, TreeNode} from "primeng/api";
import {TreeModule} from "primeng/tree";
import {UUID} from "../../../../../kc_shared/models/uuid.model";

@Component({
  selector: 'app-projects-tree',
  template: `
    <p-tree #tree
            [value]="treeNodes" selectionMode="single"
            [(selection)]="selectedNode"
            (onNodeSelect)="selectProject($event.node.key)"
            (onNodeExpand)="setExpand($event.node.key, true)"
            (onNodeCollapse)="setExpand($event.node.key, false)"
            (onNodeDrop)="onNodeDrop($event)"
            [draggableNodes]="true"
            [droppableNodes]="true"
            draggableScope="self"
            droppableScope="self"
            [filter]="true"
            filterPlaceholder="Search for Projects..."
            filterMode="strict"
            [contextMenu]="cm"
            scrollHeight="flex"
            styleClass="p-fluid">

      <ng-template pTemplate="header">
    <span class="p-buttonset">
      <button pButton
              type="button"
              label="New Project"
              icon="pi pi-plus"
              (click)="newProject()">
      </button>
      <button pButton
              type="button"
              label="Delete"
              [disabled]="treeNodes.length === 0"
              icon="pi pi-trash"
              class="p-button-danger"
              (click)="delete()">
      </button>
    </span>
      </ng-template>

      <ng-template let-node pTemplate="default">
        {{node.label}}
      </ng-template>

      <ng-template pTemplate="empty"></ng-template>

      <ng-template pTemplate="footer">
    <span class="p-buttonset">
      <button pButton
              type="button"
              class="p-button-secondary"
              label="Collapse All"
              [disabled]="treeNodes.length === 0"
              (click)="collapseAll()"></button>

      <p-divider layout="vertical" type="dashed"></p-divider>

      <button pButton
              type="button"
              class="p-button-secondary"
              [disabled]="treeNodes.length === 0"
              label="Expand All"
              (click)="expandAll()"></button>
    </span>
      </ng-template>
    </p-tree>

    <p-contextMenu #cm [model]="menuItems" [autoZIndex]="true" appendTo="body" [baseZIndex]="9999"></p-contextMenu>
  `,
  styles: [
    `
      .projects-tree-controls-container {
        display: flex;
        flex-direction: row;
        justify-content: space-evenly;
        align-items: center;
        flex-wrap: nowrap;
      }

      .background-highlight {
        background-color: #8282828f;
        font-weight: bolder;
      }

      ::ng-deep {
        .p-tree {
          height: 100%;
          border: none;
        }
      }
    `
  ]
})
export class ProjectsTreeComponent implements OnInit {
  @ViewChild('tree') pTree!: TreeModule;

  // Emitted when the parent element should hide the tree
  @Output() onHide = new EventEmitter<any>();

  // Emitted when a project should be created. Value can be string (parent ID) or undefined
  @Output() onProjectCreation = new EventEmitter<UUID | undefined>();

  // Emitted when a project is to be deleted. Parent element should warn and process
  // Value: Project ID
  @Output() onProjectDeletion = new EventEmitter<UUID>();

  // Emitted when a project is to be edited
  // Value: Project ID
  @Output() onProjectEdit = new EventEmitter<UUID>();

  @Input() treeNodes: TreeNode[] = [];

  @Input() selectedNode: TreeNode = {};

  menuItems = [
    {
      label: 'Add Subproject',
      icon: PrimeIcons.PLUS,
      command: () => {
        this.newProject(this.selectedNode.key);
        this.onHide.emit();
      }
    },
    {
      label: 'Edit', icon: PrimeIcons.PENCIL, command: () => {
        this.editProject();
        this.onHide.emit();
      }
    },
    {
      label: 'Delete', icon: PrimeIcons.TRASH, command: () => {
        this.delete(this.selectedNode.key);
        this.onHide.emit();
      }
    }
  ];

  constructor(private projectService: ProjectService) {
  }

  ngOnInit(): void {
  }

  selectProject(id: any): void {
    this.projectService.setCurrentProject(id);
    this.onHide.emit();
  }

  setExpand(id: string, expand: boolean) {
    this.projectService.updateProjects([{
      id: {value: id},
      expanded: expand
    }]);
  }

  delete(projectId?: string, _?: any): void {
    let id = projectId ?? this.selectedNode.key ?? '';

    this.onProjectDeletion.emit({value: id});
    this.onHide.emit();
  }

  newProject(parentId?: string): void {
    this.onHide.emit();
    this.onProjectCreation.emit(parentId ? {value: parentId} : undefined);
  }


  editProject() {
    let id = this.selectedNode.key ?? '';
    this.onProjectEdit.emit({value: id});
    this.onHide.emit(true);
  }

  expandAll() {
    this.treeNodes.forEach(node => {
      this.expandRecursive(node, true);
    });
    this.projectService.setAllExpanded(true);
  }

  collapseAll() {
    this.treeNodes.forEach(node => {
      this.expandRecursive(node, false);
    });
    this.projectService.setAllExpanded(false);
  }

  onNodeDrop($event: any) {
    console.debug('ProjectTree.onNodeDrop($event) | $event === ', $event);
    $event.originalEvent.preventDefault();
    $event.originalEvent.stopPropagation();

    let dragNode = $event.dragNode;
    let dropNode = $event.dropNode;

    let dragId = dragNode.key;
    let dropId = dropNode.key;

    console.debug(`ProjectTree.onNodeDrop($event) | Moving ${dragNode.label} (${dragId}) to ${dropNode.label} (${dropId})...`);

    let dragProject = this.projectService.getProject(dragId);
    let dropProject = this.projectService.getProject(dropId);

    if (!dragProject || !dropProject) {
      console.error('Attempting to drag/drop invalid project, aborting...');
      return;
    }

    let updates: ProjectUpdateRequest[] = [
      {id: dragProject.id, parentId: dropId},
      {id: dropProject.id, addSubprojects: [dragId]}
    ];
    if (dragProject.parentId?.value.length) {
      updates.push({
        id: dragProject.parentId,
        removeSubprojects: [dragId]
      })
    }

    this.projectService.updateProjects(updates).catch((reason) => {
      console.error('ProjectTree.onNodeDrop($event) | error === ', reason);
    })
  }

  private expandRecursive(node: TreeNode, isExpand: boolean) {
    if (node.children) {
      node.children.forEach(childNode => {
        this.expandRecursive(childNode, isExpand);
      });
    }
    node.expanded = isExpand;
  }
}
