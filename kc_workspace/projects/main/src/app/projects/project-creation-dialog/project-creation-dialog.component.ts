import {Component, Inject, OnInit} from '@angular/core';
import {ProjectCreationRequest} from "../../../../../shared/src/models/project.model";
import {ProjectService} from "../../../../../shared/src/services/projects/project.service";
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FormBuilder, FormGroup} from "@angular/forms";

@Component({
  selector: 'app-project-creation-dialog',
  templateUrl: './project-creation-dialog.component.html',
  styleUrls: ['./project-creation-dialog.component.scss']
})

export class ProjectCreationDialogComponent implements OnInit {
  project: ProjectCreationRequest;
  types = [
    {value: 'default', displayValue: 'Default'},
    {value: 'school', displayValue: 'School'},
    {value: 'work', displayValue: 'Work'},
    {value: 'hobby', displayValue: 'Hobby'}
  ]
  selectedType: 'school' | 'work' | 'hobby' | 'default' = 'default';
  uploadToggle: boolean = false;
  private formGroup: FormGroup;

  constructor(private projectService: ProjectService,
              public dialogRef: MatDialogRef<ProjectCreationDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: string,
              formBuilder: FormBuilder) {
    this.project = {
      name: '',
      topics: [],
      type: 'default'
    };

    this.formGroup = formBuilder.group({
      uploadToggle: '',
    });
  }

  ngOnInit(): void {
    this.init();
  }


  create(): void {
    if (this.project?.name) {
      this.project.type = this.selectedType;
      this.projectService.newProject(this.project);
      this.dialogRef.close();
    }
  }

  dismiss(): void {
    this.dialogRef.close();
  }

  init(): void {
    this.project = {name: ''};

    if (this.data) {
      this.project.parentId = this.data;
    }
  }


  addTopic($event: string[]) {
    this.project.topics = [...$event];
  }

  onFileSelected() {

  }
}
