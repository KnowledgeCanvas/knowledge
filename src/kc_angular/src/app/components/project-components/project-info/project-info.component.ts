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
