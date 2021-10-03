/**
 Copyright 2021 Rob Royce

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

import {Component, Inject, OnInit} from '@angular/core';
import {ProjectCreationRequest, ProjectModel} from "projects/ks-lib/src/lib/models/project.model";
import {ProjectService} from "../../../../../ks-lib/src/lib/services/projects/project.service";
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {KcCalendar} from "../../../../../ks-lib/src/lib/models/calendar.model";

export function noWhitespaceValidator(control: FormControl) {
  return ((control.value || '').trim().length === 0) ? {'whitespace': true} : null;
}

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

  projectCreationForm: FormGroup;

  panelOpenState: boolean;

  constructor(public dialogRef: MatDialogRef<ProjectCreationDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: string | undefined,
              private projectService: ProjectService) {

    this.projectCreationForm = new FormGroup({
      name: new FormControl('', [
        Validators.pattern(/^[a-zA-Z0-9!@#$%^&*/\\() _-]{3,64}$/),
        Validators.minLength(3),
        Validators.required,
        noWhitespaceValidator
      ]),
      type: new FormControl('default', [Validators.required]),
      description: new FormControl(''),
      inherit: new FormControl(false),
      upload: new FormControl(false)
    });

    this.project = new ProjectModel('', {value: ''}, 'default');

    this.panelOpenState = false;
  }

  get name() {
    return this.projectCreationForm.get('name');
  }

  get type() {
    return this.projectCreationForm.get('type');
  }

  get description() {
    return this.projectCreationForm.get('description');
  }

  get inherit() {
    return this.projectCreationForm.get('inherit');
  }

  get upload() {
    return this.projectCreationForm.get('upload');
  }

  get f() {
    return this.projectCreationForm.controls;
  }

  ngOnInit(): void {
    this.project.topics = [];

    if (this.data) {
      this.project.parentId = {value: this.data};
    }
  }

  create(): void {
    // TODO: validate project names (no blanks, etc.)
    let name = (this.name?.value || '').trim();

    if (name.length > 0) {
      this.project.name = name;
      this.project.type = (this.type?.value || 'default');
      this.project.description = (this.description?.value || '');

      if (this.project.type === 'school') {
        let homework: ProjectCreationRequest = {
          authors: [], type: 'school',
          description: "Automatically generated for 'School' type project",
          knowledgeSource: [], name: "Homework"
        };
        this.project.subProjects = [homework];
      }

      this.projectService.newProject(this.project);

      this.dialogRef.close();
    }
  }

  dismiss(): void {
    this.dialogRef.close();
  }

  addTopic($event: string[]) {
    this.project.topics = [...$event];
  }

  onNameChange() {
    let name = (this.name?.value || '').trim();
    this.projectCreationForm.patchValue({['name']: name});


  }

  onStartChange($event: any) {
    if (!this.project.calendar) {
      this.project.calendar = new KcCalendar();
    }
    this.project.calendar.start = $event;
  }

  onEndChange($event: any) {
    if (!this.project.calendar) {
      this.project.calendar = new KcCalendar();
    }
    this.project.calendar.end = $event;
  }
}
