import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {ProjectService} from "../../../../../ks-lib/src/lib/services/projects/project.service";
import {ProjectModel} from "projects/ks-lib/src/lib/models/project.model";
import {MatAccordion} from "@angular/material/expansion";
import {KcCalendar} from "../../../../../ks-lib/src/lib/models/calendar.model";

@Component({
  selector: 'app-canvas-details-overview',
  templateUrl: './project-details-overview.component.html',
  styleUrls: ['./project-details-overview.component.scss']
})
export class ProjectDetailsOverviewComponent implements OnInit {
  @ViewChild('accordion', {static: true}) Accordion?: MatAccordion
  currentProject: ProjectModel = new ProjectModel('', {value: ''});
  notes: string[] = [];
  detailsHidden: boolean = false;

  constructor(private projectService: ProjectService) {
    projectService.currentProject.subscribe((data) => {
      if (!data.calendar)
        data.calendar = new KcCalendar();
      this.currentProject = data;
    });
  }

  ngOnInit(): void {
  }

  setDescription() {
    this.projectService.updateProject({id: this.currentProject.id});
  }

  openAll() {
    this.Accordion?.openAll();
  }

  closeAll() {
    this.Accordion?.closeAll();
  }

  setNotes() {
    this.projectService.updateProject({id: this.currentProject.id});
  }

  calStart($event: any) {
    console.log('Calendar start changed: ', $event);
    if (this.currentProject.calendar) {
      this.currentProject.calendar.start = $event;
    } else {
      this.currentProject.calendar = new KcCalendar();
      this.currentProject.calendar.start = $event;
    }

    this.projectService.updateProject({id: this.currentProject.id});
  }

  calEnd($event: any) {
    console.log('Calendar end changed: ', $event);
    if (this.currentProject.calendar) {
      this.currentProject.calendar.end = $event;
    } else {
      this.currentProject.calendar = new KcCalendar();
      this.currentProject.calendar.end = $event;
    }
    this.projectService.updateProject({id: this.currentProject.id});
  }

  getProjectIcon(): string {
    switch (this.currentProject.type) {
      case "hobby":
        return 'supervised_user_circle';
      case "school":
        return 'school';
      case "work":
        return 'work'
      default:
        return 'folder';
    }
  }
}
