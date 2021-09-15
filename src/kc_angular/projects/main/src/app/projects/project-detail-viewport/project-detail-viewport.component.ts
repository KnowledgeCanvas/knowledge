import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {ProjectModel} from "projects/ks-lib/src/lib/models/project.model";
import {ProjectService} from "../../../../../ks-lib/src/lib/services/projects/project.service";


@Component({
  selector: 'app-project-detail-viewport',
  templateUrl: './project-detail-viewport.component.html',
  styleUrls: ['./project-detail-viewport.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ProjectDetailViewportComponent implements OnInit {
  project: ProjectModel | null = null;

  constructor(private projectService: ProjectService) {
    this.project = null;

    this.projectService.currentProject.subscribe(project => {
      if (project.id.value.trim() !== '')
        this.project = project;
      else
        this.project = null;
    });
  }

  ngOnInit(): void {
  }
}
