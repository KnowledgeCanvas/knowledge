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

import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CytoscapeLayout} from "./graph.layouts";


@Component({
  selector: 'graph-controls',
  template: `
    <div class="graph-controls surface-ground p-4 gap-4">
      <div class="flex flex-row gap-2">
        <div class="flex">
          <button pButton icon="pi pi-arrows-alt" (click)="onReset.emit()"></button>
        </div>

        <div class="flex">
          <p-dropdown [options]="layouts"
                      [(ngModel)]="selectedLayout"
                      optionLabel="name"
                      (onChange)="onLayout.emit(selectedLayout)">
          </p-dropdown>
          <button pButton icon="pi pi-refresh" (click)="onRun.emit()"></button>
        </div>

        <div class="flex">
          <button pButton icon="pi pi-cog" (click)="onSettings.emit()"></button>
        </div>
      </div>

      <div *ngIf="running">
        Running...
        <!--        TODO: clicking stop does not work...-->
        <!--        <div class="cursor-pointer" (click)="onStop.emit()">click to stop</div>-->
      </div>
    </div>
  `,
  styles: [
    `
      .graph-controls {
        min-width: 12rem;
        max-width: 36rem;
        display: flex;
        position: absolute;
        right: 0;
        flex-direction: column;
        flex-wrap: nowrap;
        align-content: center;
        justify-content: space-between;
        z-index: 9;
      }

      .graph-settings {

      }
    `
  ]
})
export class GraphControlsComponent implements OnInit {
  @Input() showSources: boolean = false;

  @Input() layouts: CytoscapeLayout[] = [];

  @Input() running: boolean = false;

  @Output() onReset = new EventEmitter();

  @Output() onBack = new EventEmitter();

  @Output() onRun = new EventEmitter();

  @Output() onLayout = new EventEmitter<CytoscapeLayout>();

  @Output() onShowSources = new EventEmitter<boolean>();

  @Output() onSettings = new EventEmitter();

  @Output() onStop = new EventEmitter();

  selectedLayout: CytoscapeLayout = this.layouts[0];

  constructor() {

  }

  ngOnInit(): void {
  }

}
