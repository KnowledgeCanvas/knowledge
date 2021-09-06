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
    console.log('Start On change: ', $event);
    this.start.emit($event.value);
  }

  endDateChange($event: MatDatepickerInputEvent<ExtractDateTypeFromSelection<DateRange<any>>, DateRange<any>>) {
    console.log('End On change: ', $event);
    this.end.emit($event.value);
  }
}
