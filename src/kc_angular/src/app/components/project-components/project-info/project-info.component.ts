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
import {Component, OnInit} from '@angular/core';
import {KcProject} from "../../../models/project.model";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";

@Component({
  selector: 'app-project-info',
  templateUrl: './project-info.component.html',
  styleUrls: ['./project-info.component.scss']
})
export class ProjectInfoComponent implements OnInit {
  project: KcProject;
  start: Date | null = null;
  end: Date | null = null;

  constructor(private ref: DynamicDialogRef, private config: DynamicDialogConfig) {
    // Get the specified project
    this.project = config.data.project;

    if (typeof this.project.calendar.start === 'string') {
      this.start = new Date(this.project.calendar.start);
    } else {
      this.start = this.project.calendar.start;
    }

    if (typeof this.project.calendar.end === 'string') {
      this.end = new Date(this.project.calendar.end);
    } else {
      this.end = this.project.calendar.end;
    }

  }

  ngOnInit(): void {
  }


  onEndChange($event?: Date) {
    // This function explicitly synchronizes project end date with surrogate
    if (!$event) {
      this.project.calendar.end = null;
      return;
    }
    this.project.calendar.end = $event;
  }

  onStartChange($event?: Date) {
    // This function explicitly synchronizes project start date with surrogate
    if (!$event) {
      this.project.calendar.start = null;
      return;
    }
    this.project.calendar.start = $event;
  }
}
