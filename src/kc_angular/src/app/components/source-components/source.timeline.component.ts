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

import { Component } from '@angular/core';
import { KnowledgeSource } from '@app/models/knowledge.source.model';

@Component({
  selector: 'source-timeline',
  template: `
    <div class="col-12 mt-4">
      <h3 class="text-2xl font-bold mt-4">Due Date</h3>
      <div class="source-due-date p-inputgroup">
        <button
          (click)="dueDateCal.toggle()"
          icon="pi pi-calendar-plus"
          pButton
          pTooltip="Select a date and time when {{ source.title }} is due."
        ></button>
        <div class="p-float-label">
          <p-calendar
            #dueDateCal
            [(ngModel)]="source.dateDue"
            (ngModelChange)="dueDate($event)"
            [hideOnDateTimeSelect]="false"
            [monthNavigator]="true"
            [numberOfMonths]="1"
            [showButtonBar]="true"
            [showIcon]="false"
            [showOtherMonths]="true"
            [showTime]="false"
            appendTo="body"
            class="p-fluid"
            hourFormat="12"
            inputId="dueDate"
            placeholder="Due Date"
          >
          </p-calendar>
        </div>
        <button
          (click)="dueDate(undefined)"
          [disabled]="!source.dateDue"
          icon="pi pi-times"
          pButton
        ></button>
      </div>
    </div>
  `,
  styleUrls: ['./source.styles.scss'],
})
export class SourceTimelineComponent {
  source!: KnowledgeSource;

  constructor() {}

  dueDate(event: any) {
    console.log('Due date changed: ', event);
    if (event === undefined) {
      this.source.dateDue = undefined;
    } else {
      this.source.dateDue = new Date(event);
    }
  }

  /* Populate the calendar with the dateModified, dateAccessed, and other events */
  // populateCalendar(ks: KnowledgeSource) {
  //   this.events = [];
  //
  //   // Add dateModified to calendar
  //   for (const mod of this.ks.dateModified) {
  //     this.events.push({
  //       status: 'Modified',
  //       date: mod,
  //     });
  //   }
  //
  //   // Add dateAccessed to calendar
  //   for (const access of this.ks.dateAccessed) {
  //     this.events.push({
  //       status: 'Accessed',
  //       date: access,
  //     });
  //   }
  //
  //   // Create events array if it doesn't exist
  //   if (!this.ks.events) {
  //     this.ks.events = [];
  //   }
  //
  //   // Add events to calendar
  //   for (const event of this.ks.events) {
  //     this.events.push({
  //       status: event.label,
  //       date: event.date,
  //     });
  //   }
  //
  //   // Sort events by date
  //   this.events.sort((a, b) => {
  //     a = new Date(a.date);
  //     b = new Date(b.date);
  //     if (a < b) return -1;
  //     if (a > b) return 1;
  //     return 0;
  //   });
  //
  //   // Make sure dateDue is a Date object
  //   if (ks.dateDue) {
  //     ks.dateDue = new Date(ks.dateDue);
  //   } else {
  //     ks.dateDue = undefined;
  //   }
  // }
}
