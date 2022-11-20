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
import {Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges} from '@angular/core';
import {ProjectTreeFactoryService} from "../../services/factory-services/project-tree-factory.service";
import {BehaviorSubject, merge, Observable, skip, Subject, tap} from "rxjs";
import {filter, map, takeUntil} from "rxjs/operators";
import {ProjectService} from "../../services/factory-services/project.service";
import {TreeNode} from "primeng/api";
import {constructTreeNodes} from "../../workers/tree.worker";
import {NotificationsService} from "../../services/user-services/notifications.service";

@Component({
  selector: 'project-selector',
  template: `
    <p-treeSelect [ngModel]="selected | async"
                  [options]="(nodes | async) ?? []"
                  [filter]="filter"
                  id="projectSelector"
                  [selectionMode]="selectionMode"
                  [placeholder]="placeholder"
                  [class]="styleClass"
                  [disabled]="disabled"
                  [showClear]="showClear"
                  [inputId]="inputId"
                  (onClear)="onSelect.emit(undefined)"
                  (onNodeSelect)="onSelect.emit($event.node)"
                  emptyMessage="No Projects"
                  appendTo="body">
    </p-treeSelect>
    <label *ngIf="label" for="projectSelector">{{label}}</label>
  `,
  styles: []
})
export class ProjectSelectorComponent implements OnInit, OnDestroy, OnChanges {
  @Input() filter: boolean = true;

  @Input() selectionMode: 'single' = 'single';

  @Input() placeholder: string = 'Choose a Project';

  @Input() styleClass: string = 'p-fluid w-full'

  @Input() disabled: boolean = false;

  @Input() showClear: boolean = true;

  @Input() setDefault: boolean = true;

  @Input() setById?: string = ''

  @Input() inputId: string = '';

  @Input() label?: string = '';

  @Output() onSelect = new EventEmitter<TreeNode | undefined>();

  selected: Observable<TreeNode>;

  nodes: Observable<TreeNode[]>;

  private _setById = new BehaviorSubject<TreeNode>({});

  private cleanUp: Subject<any> = new Subject<any>();

  constructor(private tree: ProjectTreeFactoryService, private projects: ProjectService, private notifications: NotificationsService) {
    const fromTree = this.tree.selected.pipe(
      takeUntil(this.cleanUp),
      filter(x => this.setDefault)
    )

    const fromInput = this._setById.asObservable().pipe(
      takeUntil(this.cleanUp),
      skip(1)
    )

    this.selected = merge(fromTree, fromInput).pipe(
      tap((selected) => {
        setTimeout(() => {
          this.onSelect.emit(selected);
        })
      })
    )

    this.nodes = this.projects.projectTree.pipe(
      takeUntil(this.cleanUp),
      map(pt => constructTreeNodes(pt, true))
    )
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.setById?.currentValue) {
      const node = this.tree.findTreeNode(changes.setById.currentValue)
      if (node) {
        this.notifications.debug('Project Selector', 'Setting by Project ID', node);
        this._setById.next(node);
      }
    }
  }

  ngOnDestroy() {
    this.notifications.debug('Project Selector', 'On Destroy', 'Cleaning up...');
    this.cleanUp.next({});
    this.cleanUp.complete();
  }
}
