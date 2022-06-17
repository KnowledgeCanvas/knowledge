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

import { Injectable } from '@angular/core';
import {ProjectTreeNode} from "../../models/project.tree.model";
import {TreeNode} from "primeng/api";
import {ProjectService} from "./project.service";

@Injectable({
  providedIn: 'root'
})
export class ProjectTreeFactoryService {

  constructor(private projectService: ProjectService) { }

  constructTreeNodes(projectNodes: ProjectTreeNode[], collapsed: boolean):  TreeNode[] {
    let treeNodes: TreeNode[] = [];

    for (let node of projectNodes) {
      let proj = this.projectService.getProject(node.id);

      // The collapsed flag means we do not want to use the ACTUAL project nodes, so make a deep copy
      if (collapsed) {
        proj = JSON.parse(JSON.stringify(proj));
      }

      let treeNode: TreeNode = {
        label: node.name,
        data: JSON.stringify(proj?.knowledgeSource),
        expanded: collapsed ? false : node.expanded,
        leaf: node.subprojects.length === 0,
        selectable: true,
        draggable: true,
        droppable: true,
        children: node.subprojects.length > 0 ? this.constructTreeNodes(node.subprojects, collapsed) : [],
        key: node.id
      };
      treeNodes.push(treeNode);
    }

    return treeNodes;
  }

  findTreeNode(treenodes: TreeNode[], id: string): TreeNode | undefined {
    let found = treenodes.find(n => n.key === id);
    if (found) {
      return found;
    }
    for (let node of treenodes) {
      if (node.children && node.children.length > 0) {
        found = this.findTreeNode(node.children, id);
        if (found) {
          return found;
        }
      }
    }
    return undefined;
  }
}
