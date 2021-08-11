import {Component, OnInit} from '@angular/core';
import {ProjectService} from "../../../../../../shared/src/services/projects/project.service";
import {ProjectModel} from "../../../../../../shared/src/models/project.model";
import {KnowledgeSourceModel} from "../../../../../../shared/src/models/knowledge.source.model";

@Component({
  selector: 'app-knowledge-source-view',
  templateUrl: './knowledge-source-view.component.html',
  styleUrls: ['./knowledge-source-view.component.scss']
})
export class KnowledgeSourceViewComponent implements OnInit {
  project: ProjectModel | null = {};
  knowledgeSource: KnowledgeSourceModel[] = [];

  constructor(private projectService: ProjectService) {
    this.projectService.currentProject.subscribe(project => {
      if (project?.name && project?.id !== '') {
        this.project = project;
        if (project.knowledgeSource && project.knowledgeSource.length > 0)
          this.knowledgeSource = project.knowledgeSource;
        else
          this.knowledgeSource = [];
      } else {
        this.project = null;
        this.knowledgeSource = [];
      }
    });
  }

  ngOnInit(): void {}

}
