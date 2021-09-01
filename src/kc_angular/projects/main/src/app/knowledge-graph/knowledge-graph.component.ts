import { Component, OnInit } from '@angular/core';
import {ProjectService} from "../../../../ks-lib/src/lib/services/projects/project.service";
import {ProjectModel} from "projects/ks-lib/src/lib/models/project.model";

@Component({
  selector: 'app-knowledge-graph',
  templateUrl: './knowledge-graph.component.html',
  styleUrls: ['./knowledge-graph.component.scss']
})
export class KnowledgeGraphComponent implements OnInit {
  currentProject: ProjectModel | undefined = undefined;

  constructor(private projectService: ProjectService) {
    this.projectService.currentProject.subscribe((project) => {
      this.currentProject = project;
    })
  }

  ngOnInit(): void {
  }

}
