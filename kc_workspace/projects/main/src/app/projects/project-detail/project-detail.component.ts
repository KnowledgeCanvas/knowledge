import {Component, Input, OnInit, ViewEncapsulation} from '@angular/core';
import {ProjectModel} from "../../../../../shared/src/models/project.model";
import {ProjectService} from "../../../../../shared/src/services/projects/project.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {TopicModel} from "../../../../../shared/src/models/topic.model";

export interface ProjectTags {
  name: string;
}

@Component({
  selector: 'app-project-detail',
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ProjectDetailComponent implements OnInit {
  @Input() projectId: string | null = '';
  project: ProjectModel | null = null;
  isExpanded = true;
  addOnBlur = true;
  selectable = true;
  topics?: TopicModel[] = [];

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
