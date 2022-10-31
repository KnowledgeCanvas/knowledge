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

export class GraphSettings {
  display: {
    groupSources: boolean,
    showSources: boolean
  } = {
    groupSources: false,
    showSources: true
  };
}

@Component({
  selector: 'graph-controls',
  template: `
    <div class="graph-controls surface-ground p-4 gap-4">
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

      <!--      <div class="flex">-->
      <!--        <button pButton icon="pi pi-cog" (click)="dialog = !dialog"></button>-->
      <!--      </div>-->
    </div>

    <p-dialog [modal]="true" [(visible)]="dialog" #settings [title]="'Graph Settings'" [showHeader]="true">
      <ng-template pTemplate="header">
        <h1>Graph Settings</h1>
      </ng-template>
      <div class="flex flex-column gap-2">
        <div class="flex flex-row gap-2">
          <p-toggleButton [(ngModel)]="graphgSettings.display.showSources" (onChange)="onSettingsChange.emit(graphgSettings)" onLabel="Show Sources"
                          offLabel="Show Sources"></p-toggleButton>
          <p-toggleButton [(ngModel)]="graphgSettings.display.groupSources" onLabel="Group Sources" offLabel="Group Sources"></p-toggleButton>
        </div>
      </div>
    </p-dialog>
  `,
  styles: [
    `
      .graph-controls {
        min-width: 12rem;
        max-width: 36rem;
        display: flex;
        position: absolute;
        right: 0;
        flex-direction: row;
        flex-wrap: nowrap;
        align-content: center;
        justify-content: space-between;
        z-index: 9;
      }
    `
  ]
})
export class GraphControlsComponent implements OnInit {
  @Output() onReset = new EventEmitter();

  @Output() onBack = new EventEmitter();

  @Output() onRun = new EventEmitter();

  @Output() onLayout = new EventEmitter<CytoscapeLayout>();

  @Output() onShowSources = new EventEmitter<boolean>();

  @Output() onSettingsChange = new EventEmitter<GraphSettings>();

  @Input() showSources: boolean = false;

  @Input() layouts: CytoscapeLayout[] = [];

  selectedLayout: CytoscapeLayout = this.layouts[0];

  graphgSettings = new GraphSettings();

  dialog: boolean = false;

  constructor() {
  }

  ngOnInit(): void {
  }

}
