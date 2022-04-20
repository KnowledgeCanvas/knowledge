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

import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {CalendarOptions, FullCalendarModule} from "@fullcalendar/angular";
import {ProjectModel} from "../../../models/project.model";
import {UuidModel} from "../../../models/uuid.model";
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import {KnowledgeSource} from "../../../models/knowledge.source.model";

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
  url?: string | UuidModel
}

export interface KcCardRequest {
  event: any,
  element: any,
  ksId?: UuidModel,
  projectId?: UuidModel
}

@Component({
  selector: 'app-project-calendar',
  templateUrl: './project-calendar.component.html',
  styleUrls: ['./project-calendar.component.scss']
})
export class ProjectCalendarComponent implements OnInit, OnChanges {
  @Input() kcProject!: ProjectModel | null;

  @Input() ksList!: KnowledgeSource[];

  @Output() onProjectClick = new EventEmitter<KcCardRequest>();

  @Output() onKsClick = new EventEmitter<KcCardRequest>();

  calendarOptions: CalendarOptions = {events: []};

  deepChangeDetection: boolean = true;

  viewReady: boolean = false;

  constructor() {
  }

  ngOnInit(): void {
    this.configureCalendar();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.kcProject)
      this.setupCalendar();
  }

  configureCalendar() {
    this.calendarOptions.initialView = 'listYear';
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
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listYear'
    }

    this.calendarOptions.eventClick = (args) => {
      args.jsEvent.preventDefault();

      if (args.event._def.url === 'project') {
        this.onProjectClick.emit({
          event: args.jsEvent,
          element: args.el,
          projectId: this.kcProject?.id ?? new UuidModel('')
        });
      } else {
        if (args.event._def.url) {
          this.onKsClick.emit({
            event: args.jsEvent,
            element: args.el,
            ksId: new UuidModel(args.event._def.url)
          })
        }
      }
    }
  }

  setupCalendar() {
    if (!this.kcProject) {
      console.warn('Unable to populate calendar due to missing project...');
    } else {
      if (!this.kcProject?.calendar)
        this.kcProject.calendar = {events: [], start: null, end: null};

      // @ts-ignore
      this.calendarOptions.events = this.eventsFromProject(this.kcProject);
      this.viewReady = true;
    }
  }

  eventsFromProject(project: ProjectModel): ProjectCalendarEvent[] {
    const projectColor = 'yellow';
    const projectTextColor = 'black'
    const ksList = this.eventsFromKsList(this.ksList);
    return [
      {
        title: `"${project.name}" (Created)`,
        start: project.dateCreated,
        color: projectColor,
        textColor: projectTextColor,
        url: 'project'
      },
      {
        title: `"${project.name}" (Modified)`,
        start: project.dateModified,
        color: projectColor,
        textColor: projectTextColor,
        url: 'project'
      },
      {
        title: `"${project.name}" (Accessed)`,
        start: project.dateAccessed,
        color: projectColor,
        textColor: projectTextColor,
        url: 'project'
      },
      ...ksList
    ];

  }

  eventsFromKsList(ksList: KnowledgeSource[]) {
    const createdColor = 'green';
    const modifiedColor = 'orange';
    const accessedColor = 'blue';
    let events: ProjectCalendarEvent[] = [];
    for (let ks of ksList) {
      events.push({
        title: `${ks.title}`,
        start: ks.dateCreated,
        url: ks.id.value,
        color: createdColor
      });
      ks.dateModified.forEach((d) => {
        events.push({
          title: `${ks.title}`,
          start: d,
          url: ks.id.value,
          color: modifiedColor
        });
      });
      ks.dateAccessed.forEach((d) => {
        events.push({
          title: `${ks.title}`,
          start: d,
          url: ks.id.value,
          color: accessedColor
        });
      });
      if (ks.dateDue) {
        events.push({
          title: `${ks.title}`,
          start: ks.dateDue,
          color: 'red',
          url: ks.id.value
        });
      }
    }
    return events;
  }

}
