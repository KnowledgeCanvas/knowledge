/*
 * Copyright (c) 2022 Rob Royce
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

import {Component, Input, OnChanges, OnInit, SimpleChanges} from "@angular/core";

@Component({
  selector: 'graph-status',
  template: `
    <div class="graph-status">
      <div class="pt-2 flex flex-row justify-content-between align-items-center text-500">
        <div #run *ngIf="running else done">Running... ({{runtime | number: '1.1'}}s elapsed)</div>
        <ng-template #done>Done</ng-template>
      </div>
    </div>
  `,
  styles: [
    `
      .graph-status {
        height: 1rem;
        position: absolute;
        bottom: 5rem;
        padding-left: 0.5rem;
      }
    `
  ]
})
export class GraphStatusComponent implements OnInit, OnChanges {

  @Input() running: boolean = false;

  runtime: number = 0;

  runtimeInterval: any;

  constructor() {
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes?.running?.currentValue !== undefined) {
      if (changes?.running?.currentValue) {
        this.runtime = 0;
        this.runtimeInterval = setInterval(() => {
          this.runtime += 0.5;
        }, 500)
      } else {
        if (this.runtimeInterval) {
          clearInterval(this.runtimeInterval);
        }
      }
    }
  }
}

