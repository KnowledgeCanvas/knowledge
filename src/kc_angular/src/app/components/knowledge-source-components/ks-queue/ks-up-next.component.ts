/**
 Copyright 2021 Rob Royce

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

import {Component, EventEmitter, HostListener, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges} from '@angular/core';
import {KnowledgeSource} from "src/app/models/knowledge.source.model";
import {MenuItem, PrimeIcons, TreeNode} from "primeng/api";

@Component({
  selector: 'app-ks-up-next',
  templateUrl: './ks-up-next.component.html',
  styleUrls: ['./ks-up-next.component.scss']
})
export class KsUpNextComponent implements OnInit, OnDestroy, OnChanges {
  @Input() ksQueue: KnowledgeSource[] = [];
  @Input() projectTreeNodes: TreeNode[] = [];
  @Input() selectedProject?: TreeNode;
  @Output() onClose = new EventEmitter<any>();
  @Output() onClear = new EventEmitter<any>();
  @Output() onUpdate = new EventEmitter<{ projectId: string, ksList: KnowledgeSource[] }[]>();
  @Output() onRemove = new EventEmitter<KnowledgeSource>();
  destinationList: KnowledgeSource[] = [];
  menu: MenuItem[] = [
    {
      icon: PrimeIcons.TRASH, label: 'Remove', command: (_: any) => {
        if (this._selectedKsId) {
          let ks = this.ksQueue.find(k => k.id.value === this._selectedKsId);
          if (ks) {
            this.onRemove.emit(ks);
          }
        }
      }
    }
  ];
  private _ksToProjectMapping: { projectId: string, ksList: KnowledgeSource[] }[] = [];
  private _selectedKsId?: string;

  constructor() {
  }

  get pending() {
    return this._ksToProjectMapping.length > 0;
  }

  @HostListener('contextmenu', ['$event']) onHostClick(event: any) {
    // A hacky and shameful way to figure out which KS is associated with the context menu click
    // Each KS in the list has its ID embedded within an HTML element
    let ksId: string;
    let ksId1 = event.target?.parentElement?.attributes?.id?.value;
    let ksId2 = event.target?.firstChild?.attributes?.id?.nodeValue;
    let ksId3 = event.target?.id;

    if (ksId1 && ksId1.length === 36) {
      ksId = ksId1;
    } else if (ksId2 && ksId2.length === 36) {
      ksId = ksId2;
    } else if (ksId3 && ksId3.length === 36) {
      ksId = ksId3;
    } else {
      ksId = '';
    }

    if (ksId && ksId.length === 36) {
      this._selectedKsId = ksId;
    } else {
      this._selectedKsId = undefined;
    }
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.selectedProject && changes.selectedProject.firstChange) {
      let mapping = {projectId: changes.selectedProject.currentValue.key, ksList: []}
      this.destinationList = mapping.ksList;
      this._ksToProjectMapping.push(mapping);
    }
  }

  ngOnDestroy() {
    if (this.pending) {
      this.onUpdate.emit(this._ksToProjectMapping);
    }
  }

  onProjectSelected($event: any) {
    // Check if project has already been used to store KS
    let projectMapping = this._ksToProjectMapping.find(p => p.projectId === $event.node.key);

    // If so, use it as our destination
    if (projectMapping) {
      this.destinationList = projectMapping.ksList;
    }

    // Otherwise, create a new mapping
    else {
      let mapping = {projectId: $event.node.key, ksList: []}
      this._ksToProjectMapping.push(mapping);
      this.destinationList = mapping.ksList;
    }
  }

  sourceSelect(_: any) {

  }

  targetSelect($event: any) {
    console.log('Target selected: ', $event);
  }

  moveToTarget(_: any) {

  }

  moveToSource(_: any) {

  }
}
