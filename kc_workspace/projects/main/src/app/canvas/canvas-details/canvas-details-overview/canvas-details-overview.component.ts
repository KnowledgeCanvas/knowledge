import { Component, OnInit } from '@angular/core';
import {ProjectService} from "../../../../../../shared/src/services/projects/project.service";
import {ProjectModel} from "../../../../../../shared/src/models/project.model";

@Component({
  selector: 'app-canvas-details-overview',
  templateUrl: './canvas-details-overview.component.html',
  styleUrls: ['./canvas-details-overview.component.scss']
})
export class CanvasDetailsOverviewComponent implements OnInit {
  currentProject: ProjectModel = {};

  constructor(private projectService: ProjectService) {
    projectService.currentProject.subscribe((data) => {
      this.currentProject = data;
    });
  }

  ngOnInit(): void {

  }

}
