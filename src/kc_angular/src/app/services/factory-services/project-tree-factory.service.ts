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

import {Injectable} from '@angular/core';
import {ProjectTreeNode} from "../../models/project.tree.model";
import {TreeNode} from "primeng/api";
import {ProjectService} from "./project.service";
import {BehaviorSubject, fromEvent, Observable, tap} from "rxjs";
import {take} from "rxjs/operators";
import {constructTreeNodes} from "../../workers/tree.worker";
import {NotificationsService} from "../user-services/notifications.service";

@Injectable({
  providedIn: 'root'
})
export class ProjectTreeFactoryService {
  private _treeNodes = new BehaviorSubject<TreeNode[]>([])

  treeNodes: Observable<TreeNode[]> = this._treeNodes.asObservable();

  constructor(private projectService: ProjectService, private notifications: NotificationsService) {
  }

  update(projectNodes: ProjectTreeNode[], collapsed: boolean, parent?: TreeNode) {
    const worker = new Worker(new URL('../../workers/tree.worker', import.meta.url));

    if (worker) {
      const nodes$ = fromEvent(worker, 'message')
      nodes$.pipe(
        take(1),
        tap((results: any) => {
          console.log('Tree results: ', results.data)
          this._treeNodes.next(results.data);
        })
      ).subscribe()

      worker.postMessage({nodes: projectNodes, collapsed: collapsed, parent: parent});
    } else {
      this.notifications.debug('Project Tree Factory', 'Project Tree Updated', 'constructing tree nodes...');
      let treeNodes: TreeNode[] = constructTreeNodes(projectNodes, collapsed, parent);

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
          parent: parent,
          droppable: true,
          key: node.id
        };

        treeNode.children = node.subprojects.length > 0 ? constructTreeNodes(node.subprojects, collapsed, treeNode) : [];
        treeNodes.push(treeNode);
      }

      this._treeNodes.next(treeNodes);
    }
  }

  findTreeNode(treenodes: TreeNode[], id: string): TreeNode | undefined {
    let found = treenodes.find(n => n.key == id);
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
