import { Component, OnInit } from '@angular/core';
import {ProjectService} from "../../../../../shared/src/services/projects/project.service";
import {ProjectModel} from "../../../../../shared/src/models/project.model";
import {MatChipInputEvent} from "@angular/material/chips";
import {COMMA, ENTER} from "@angular/cdk/keycodes";

@Component({
  selector: 'app-project-summary',
  templateUrl: './project-summary.component.html',
  styleUrls: ['./project-summary.component.scss']
})
export class ProjectSummaryComponent implements OnInit {
  currentProject: ProjectModel = {};

  constructor(private projectService: ProjectService) {
    projectService.currentProject.subscribe((project) => {
      this.currentProject = project;
    })
  }

  ngOnInit(): void {
  }

  getInfo() {
    console.log('Project info: ', this.currentProject);
  }

}
