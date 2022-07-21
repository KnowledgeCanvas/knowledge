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

import {Component, EventEmitter, HostListener, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild} from '@angular/core';
import {CalendarOptions, FullCalendarComponent, FullCalendarModule} from "@fullcalendar/angular";
import {KcProject} from "../../models/project.model";
import {UUID} from "../../../../../kc_shared/models/uuid.model";
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import {KnowledgeSource} from "../../models/knowledge.source.model";
import {EventService} from "../../services/user-services/event.service";

FullCalendarModule.registerPlugins([
  dayGridPlugin,
  timeGridPlugin,
  listPlugin,
  interactionPlugin
]);

export interface ProjectCalendarEvent {
  title: string,
  start: Date,
  color?: string,
  textColor?: string,
  url?: string | UUID
}

export interface KcCardRequest {
  event: any,
  element: any,
  ksId?: UUID,
  projectId?: UUID
}

@Component({
  selector: 'app-project-calendar',
  template: `
    <div *ngIf="viewReady" class="h-full w-full">
      <full-calendar #calendar
                     [deepChangeDetection]="deepChangeDetection"
                     class="h-full w-full"
                     style="max-height: calc(100vh - 180px)"
                     [options]="calendarOptions">
      </full-calendar>
      <br>
      <div class="text-right">
        <span class="calendar-legend-dot green"></span> Created
        <span class="calendar-legend-dot orange"></span> Modified
        <span class="calendar-legend-dot blue"></span> Accessed
        <span class="calendar-legend-dot red"></span> Due Date
      </div>
    </div>

    <div *ngIf="!viewReady">
      <p-skeleton width="100%" height="40px"></p-skeleton>
      <br>
      <p-skeleton width="100%" height="65vh"></p-skeleton>
    </div>
  `,
  styles: [
    `
      .calendar-legend-dot {
      height: 1rem;
      width: 1rem;
      border-radius: 50%;
      display: inline-block;
    }

    .calendar-legend-dot.green {
      background-color: var(--green-500);
    }

    .calendar-legend-dot.blue {
      background-color: var(--blue-500);
    }

    .calendar-legend-dot.red {
      background-color: var(--pink-500);
    }

    .calendar-legend-dot.orange {
      background-color: var(--yellow-500);
    }

    ::ng-deep {
      .fc-theme-standard .fc-list {
        border: 1px solid var(--surface-100) !important;
      }
    }
    `
  ]
})
export class ProjectCalendarComponent implements OnInit, OnChanges {
  @ViewChild('calendar') calendar!: FullCalendarComponent;

  @Input() kcProject!: KcProject | null;

  @Input() ksList: KnowledgeSource[] | null = [];

  @Output() onProjectClick = new EventEmitter<KcCardRequest>();

  @Output() onKsClick = new EventEmitter<KcCardRequest>();

  calendarOptions: CalendarOptions = {events: []};

  deepChangeDetection: boolean = true;

  viewReady: boolean = false;

  views = ['dayGridMonth', 'timeGridWeek', 'timeGridDay', 'listYear']

  viewIndex = 2;

  constructor(private events: EventService) {
  }

  ngOnInit(): void {
    this.configureCalendar();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.kcProject)
      this.setupCalendar();
  }

  @HostListener('document:keydown.Control.]')
  @HostListener('document:keydown.meta.]')
  keyPressNext() {
    this.viewIndex = (this.viewIndex + 1) % 4;
    this.calendar.getApi().changeView(this.views[this.viewIndex]);
  }

  @HostListener('document:keydown.Control.[')
  @HostListener('document:keydown.meta.[')
  keyPressPrevious() {
    this.viewIndex = this.viewIndex === 0 ? this.views.length - 1 : (this.viewIndex - 1) % 4;
    this.calendar.getApi().changeView(this.views[this.viewIndex]);
  }

  @HostListener('document:keydown.Control.t')
  @HostListener('document:keydown.meta.t')
  keyPressToday() {
    this.calendar.getApi().today();
  }

  @HostListener('document:keydown.Control.arrowright')
  @HostListener('document:keydown.meta.arrowright')
  keyPressRight() {
    this.calendar.getApi().next();
  }

  @HostListener('document:keydown.Control.arrowleft')
  @HostListener('document:keydown.meta.arrowleft')
  keyPressLeft() {
    this.calendar.getApi().prev();
  }

  configureCalendar() {
    this.calendarOptions.initialView = this.views[this.viewIndex];
    this.calendarOptions.editable = false;
    this.calendarOptions.selectable = false;
    this.calendarOptions.selectMirror = false;
    this.calendarOptions.dayMaxEvents = true;
    this.calendarOptions.nowIndicator = true;
    this.calendarOptions.expandRows = true;
    this.calendarOptions.eventMaxStack = 15;
    this.calendarOptions.headerToolbar = {
      left: 'prev,next today',
      center: 'title',
      right: this.views.join(',')
    }

    this.calendarOptions.eventClick = (args) => {
      args.jsEvent.preventDefault();

      if (args.event._def.url === 'project') {
        this.onProjectClick.emit({
          event: args.jsEvent,
          element: args.el,
          projectId: this.kcProject?.id ?? {value: ''}
        });
      } else {
        if (args.event._def.url) {
          this.onKsClick.emit({
            event: args.jsEvent,
            element: args.el,
            ksId: {value: args.event._def.url}
          })
        }
      }
    }
  }

  setupCalendar() {
    if (!this.kcProject) {
      console.warn('Unable to populate calendar due to missing project...');
    } else {
      // this.ksList = this.kcProject.knowledgeSource;
      if (!this.kcProject?.calendar)
        this.kcProject.calendar = {events: [], start: null, end: null};

      // @ts-ignore
      this.calendarOptions.events = this.events.fromProject(this.kcProject).concat(this.events.fromSourceList(this.ksList));
      this.viewReady = true;
    }
  }
}
