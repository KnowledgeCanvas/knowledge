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
import {ProjectService} from "../../../services/factory-services/project-service/project.service";
import {ProjectUpdateRequest} from "src/app/models/project.model";
import {PrimeIcons, TreeNode} from "primeng/api";
import {TreeModule} from "primeng/tree";
import {UUID} from "../../../models/uuid";

@Component({
  selector: 'app-projects-tree',
  templateUrl: './projects-tree.component.html',
  styleUrls: ['./projects-tree.component.scss']
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

  toggleFilter: boolean = false;

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
      id: new UUID(id),
      expanded: expand
    }]);
  }

  delete(projectId?: string, _?: any): void {
    let id = projectId ?? this.selectedNode.key ?? '';

    this.onProjectDeletion.emit(new UUID(id));
    this.onHide.emit();
  }

  newProject(parentId?: string): void {
    this.onHide.emit();
    this.onProjectCreation.emit(parentId ? new UUID(parentId) : undefined);
  }


  editProject() {
    let id = this.selectedNode.key ?? '';
    this.onProjectEdit.emit(new UUID(id));
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
