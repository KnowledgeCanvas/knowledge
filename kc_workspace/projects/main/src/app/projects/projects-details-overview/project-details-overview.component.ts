import {Component, OnInit} from '@angular/core';
import {ProjectService} from "../../../../../shared/src/services/projects/project.service";
import {ProjectModel} from "../../../../../shared/src/models/project.model";

@Component({
  selector: 'app-canvas-details-overview',
  templateUrl: './project-details-overview.component.html',
  styleUrls: ['./project-details-overview.component.scss']
})
export class ProjectDetailsOverviewComponent implements OnInit {
  currentProject: ProjectModel = new ProjectModel('', {value: ''});

  constructor(private projectService: ProjectService) {
    projectService.currentProject.subscribe((data) => {
      this.currentProject = data;
    });
  }

  ngOnInit(): void {
  }

}
