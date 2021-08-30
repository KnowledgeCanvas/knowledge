import {Component, Input, OnInit, ViewEncapsulation} from '@angular/core';
import {ProjectModel} from "../../../../../shared/src/models/project.model";
import {ProjectService} from "../../../../../ks-lib/src/lib/services/projects/project.service";
import {MatSnackBar} from "@angular/material/snack-bar";


@Component({
  selector: 'app-project-detail-viewport',
  templateUrl: './project-detail-viewport.component.html',
  styleUrls: ['./project-detail-viewport.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ProjectDetailViewportComponent implements OnInit {
  @Input() projectId: string | null = '';
  project: ProjectModel | null = null;
  isExpanded = true;
  addOnBlur = true;
  selectable = true;
  topics?: string[] = [];

  constructor(private projectService: ProjectService, private snackBar: MatSnackBar) {
    this.reset();
  }

  reset(): void {
    this.topics = [];
    this.project = null;

    this.projectService.currentProject.subscribe(project => {
      if (project?.name && project?.id.value !== '') {
        this.project = project;
        this.topics = project.topics;
      } else {
        this.project = null;
      }
    });
  }

  ngOnInit(): void {
  }
}
