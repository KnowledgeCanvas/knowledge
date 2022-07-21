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
import {Component, Input, OnInit} from '@angular/core';
import {EventModel} from "../../../../../kc_shared/models/event.model";

@Component({
  selector: 'app-timeline',
  template: `
    <div class="h-full w-full">
      <p-scrollPanel class="w-full h-full">
        <p-timeline *ngIf="events" [value]="events" layout="horizontal" styleClass="w-full ml-4 my-2">
          <ng-template pTemplate="opposite" let-event>
            <div class="w-full flex-row-center-start py-4 pr-4" style="min-width: 16rem">
              <small class="p-text-secondary">
                {{event.status}}
              </small>
            </div>
          </ng-template>
          <ng-template pTemplate="marker" let-event>
            <!--                TODO: add custom icons for different types of events-->
            <div class="flex-shrink-0">
              <div class="border-circle border-1 border-primary" style="width: 1rem; height: 1rem;"></div>
            </div>
          </ng-template>
          <ng-template pTemplate="content" let-event>
            <div class="w-full flex-row-center-start" style="min-width: 16rem">
              <small class="p-text-secondary">
                <!--                TODO: this should be standardized...-->
                {{event.date ?? event.timestamp | date: 'short'}}
              </small>
            </div>
          </ng-template>

        </p-timeline>
      </p-scrollPanel>
    </div>
  `
})
export class TimelineComponent implements OnInit {
  @Input() events?: EventModel[] = [];

  constructor() {
  }

  ngOnInit(): void {
  }

}
