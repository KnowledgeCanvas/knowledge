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

import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {KcCalendar} from "../../../../../ks-lib/src/lib/models/calendar.model";
import {DateRange, ExtractDateTypeFromSelection, MatDatepickerInputEvent} from "@angular/material/datepicker";

@Component({
  selector: 'app-project-calendar',
  templateUrl: './project-calendar.component.html',
  styleUrls: ['./project-calendar.component.scss']
})
export class ProjectCalendarComponent implements OnInit, OnChanges {
  @Input() calendar: KcCalendar | undefined;
  @Output() start = new EventEmitter();
  @Output() end = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {
  }

  startDateChange($event: MatDatepickerInputEvent<ExtractDateTypeFromSelection<DateRange<any>>, DateRange<any>>) {
    this.start.emit($event.value);
  }

  endDateChange($event: MatDatepickerInputEvent<ExtractDateTypeFromSelection<DateRange<any>>, DateRange<any>>) {
    this.end.emit($event.value);
  }
}
