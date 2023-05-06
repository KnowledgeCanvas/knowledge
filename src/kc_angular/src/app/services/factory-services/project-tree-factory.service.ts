/*
 * Copyright (c) 2023 Rob Royce
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

import { BehaviorSubject, fromEvent, Observable, Subject, tap } from 'rxjs';
import { Injectable, OnDestroy } from '@angular/core';
import { NotificationsService } from '@services/user-services/notifications.service';
import { ProjectService } from '@services/factory-services/project.service';
import { ProjectTreeNode } from '@app/models/project.tree.model';
import { TreeNode } from 'primeng/api';
import { constructTreeNodes } from '@app/workers/tree.worker';
import { delay, take, takeUntil } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ProjectTreeFactoryService implements OnDestroy {
  private _treeNodes = new BehaviorSubject<TreeNode[]>([]);

  treeNodes: Observable<TreeNode[]> = this._treeNodes.asObservable();

  private _selected = new BehaviorSubject<TreeNode>({});

  selected = this._selected.asObservable();

  private cleanUp: Subject<any> = new Subject<any>();

  constructor(
    private projectService: ProjectService,
    private notifications: NotificationsService
  ) {
    projectService.projectTree
      .pipe(
        takeUntil(this.cleanUp),
        tap((nodes) => {
          this.notifications.debug(
            'Project Tree Factory',
            'Project Tree Updated',
            'running update...'
          );
          this.update(nodes, false);
        })
      )
      .subscribe();

    projectService.projectTree
      .pipe(
        take(1),
        delay(1000),
        tap(() => {
          this.notifications.debug(
            'Project Tree Factory',
            'Setting Initial Project',
            ``
          );
          const projectId = projectService.getCurrentProjectId();
          if (projectId) {
            const node = this.findTreeNode(
              projectId.value,
              this._treeNodes.value
            );
            if (node) {
              this._selected.next(node);
            }
          }
        })
      )
      .subscribe();

    projectService.currentProject
      .pipe(
        takeUntil(this.cleanUp),
        tap((project) => {
          this.notifications.debug(
            'Project Tree Factory',
            'Current Project Changed',
            `${project?.name}`
          );
          if (project) {
            const node = this.findTreeNode(
              project.id.value,
              this._treeNodes.value
            );
            if (node) {
              this._selected.next(node);
            }
          }
        })
      )
      .subscribe();
  }

  ngOnDestroy() {
    this.cleanUp.next({});
    this.cleanUp.complete();
  }

  findTreeNode(id: string, treenodes?: TreeNode[]): TreeNode | undefined {
    if (!treenodes) {
      treenodes = this._treeNodes.value;
    }

    let found = treenodes.find((n) => n.key == id);
    if (found) {
      return found;
    }
    for (const node of treenodes) {
      if (node.children && node.children.length > 0) {
        found = this.findTreeNode(id, node.children);
        if (found) {
          return found;
        }
      }
    }
    return undefined;
  }

  private update(
    projectNodes: ProjectTreeNode[],
    collapsed: boolean,
    parent?: TreeNode
  ) {
    const worker = new Worker(
      new URL('../../workers/tree.worker', import.meta.url)
    );

    if (worker) {
      const nodes$ = fromEvent(worker, 'message');
      nodes$
        .pipe(
          take(1),
          tap((results: any) => {
            this._treeNodes.next(results.data);
          })
        )
        .subscribe();

      worker.postMessage({
        nodes: projectNodes,
        collapsed: collapsed,
        parent: parent,
      });
    } else {
      this.notifications.debug(
        'Project Tree Factory',
        'Web Worker Unavailable',
        'Constructing tree in main process.'
      );
      const treeNodes: TreeNode[] = constructTreeNodes(
        projectNodes,
        collapsed,
        parent
      );

      for (const node of projectNodes) {
        const proj = this.projectService.getProject(node.id);
        const treeNode: TreeNode = {
          label: node.name,
          data: JSON.stringify(proj?.knowledgeSource),
          expanded: collapsed ? false : node.expanded,
          leaf: node.subprojects.length === 0,
          selectable: true,
          draggable: true,
          parent: parent,
          droppable: true,
          key: node.id,
          icon: node.icon,
        };

        treeNode.children = constructTreeNodes(
          node.subprojects,
          collapsed,
          treeNode
        );
        treeNodes.push(treeNode);
      }

      this._treeNodes.next(treeNodes);
    }
  }
}
