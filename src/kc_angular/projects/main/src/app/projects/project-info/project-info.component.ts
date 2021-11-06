import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {ProjectModel} from "../../../../../ks-lib/src/lib/models/project.model";

export interface KcProjectInfoInput {
  project: ProjectModel
}

@Component({
  selector: 'app-project-info',
  templateUrl: './project-info.component.html',
  styleUrls: ['./project-info.component.scss']
})
export class ProjectInfoComponent implements OnInit {
  private unmodified: ProjectModel;
  project: ProjectModel;

  constructor(private dialogRef: MatDialogRef<ProjectInfoComponent>,
              @Inject(MAT_DIALOG_DATA) public data: KcProjectInfoInput) {
    // create a deep copy to compare against later
    this.unmodified = JSON.parse(JSON.stringify(data.project));

    // create a shallow copy
    this.project = data.project;
  }

  ngOnInit(): void {
  }

  projectHasChanged(project: ProjectModel): boolean {
    return JSON.stringify(this.unmodified) !== JSON.stringify(project);
  }

  save() {
    this.dialogRef.close(this.projectHasChanged(this.data.project));
  }

  cancel() {
    const previous = this.unmodified;
    this.data.project.name = previous.name;
    this.data.project.description = previous.description;
    this.dialogRef.close();
  }
}
