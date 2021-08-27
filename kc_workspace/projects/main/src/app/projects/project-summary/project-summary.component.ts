import {Component, OnInit} from '@angular/core';
import {ProjectService} from "../../../../../shared/src/services/projects/project.service";
import {ProjectModel, ProjectUpdateRequest} from "../../../../../shared/src/models/project.model";

@Component({
  selector: 'app-project-summary',
  templateUrl: './project-summary.component.html',
  styleUrls: ['./project-summary.component.scss']
})
export class ProjectSummaryComponent implements OnInit {
  currentProject: ProjectModel = new ProjectModel('', {value: ''});

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

  updateName() {
    let update: ProjectUpdateRequest = {
      id: this.currentProject.id,
      name: this.currentProject.name
    }
    this.projectService.updateProject(update);
  }
}
