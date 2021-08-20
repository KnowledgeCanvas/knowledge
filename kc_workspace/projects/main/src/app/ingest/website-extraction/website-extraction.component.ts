import {Component, OnInit} from '@angular/core';
import {KnowledgeSourceModel} from "../../../../../shared/src/models/knowledge.source.model";
import {UuidModel} from "../../../../../shared/src/models/uuid.model";
import {ProjectService} from "../../../../../shared/src/services/projects/project.service";
import {MatDialogRef} from "@angular/material/dialog";
import {ProjectUpdateRequest} from "../../../../../shared/src/models/project.model";

@Component({
  selector: 'app-website-extraction',
  templateUrl: './website-extraction.component.html',
  styleUrls: ['./website-extraction.component.scss']
})
export class WebsiteExtractionComponent implements OnInit {
  parentId: UuidModel;

  constructor(private projectService: ProjectService, private dialogRef: MatDialogRef<any>) {
    this.parentId = this.projectService.getCurrentProjectId();
    console.log('Website extraction will send to parentID: ', this.parentId);
  }

  ngOnInit(): void {
  }

  ksChange(ks: KnowledgeSourceModel) {
    let update: ProjectUpdateRequest = {
      id: this.parentId,
      addKnowledgeSource: [ks]
    }

    this.projectService.updateProject(update);
    this.dialogRef.close();
  }
}
