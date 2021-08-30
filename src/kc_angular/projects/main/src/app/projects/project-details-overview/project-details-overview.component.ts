import {Component, OnInit, ViewChild} from '@angular/core';
import {ProjectService} from "../../../../../ks-lib/src/lib/services/projects/project.service";
import {ProjectModel} from "../../../../../shared/src/models/project.model";
import {MatAccordion} from "@angular/material/expansion";

@Component({
  selector: 'app-canvas-details-overview',
  templateUrl: './project-details-overview.component.html',
  styleUrls: ['./project-details-overview.component.scss']
})
export class ProjectDetailsOverviewComponent implements OnInit {
  @ViewChild('accordion', {static: true}) Accordion?: MatAccordion
  currentProject: ProjectModel = new ProjectModel('', {value: ''});
  notes: string[] = [];

  constructor(private projectService: ProjectService) {
    projectService.currentProject.subscribe((data) => {
      this.currentProject = data;
    });
  }

  ngOnInit(): void {

  }

  setDescription() {
  }

  openAll() {
    this.Accordion?.openAll();
  }

  closeAll() {
    this.Accordion?.closeAll();
  }

  setNotes() {

  }
}
