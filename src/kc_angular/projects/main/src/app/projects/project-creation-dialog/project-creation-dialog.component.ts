import {Component, Inject, OnInit} from '@angular/core';
import {ProjectCreationRequest, ProjectModel} from "projects/ks-lib/src/lib/models/project.model";
import {ProjectService} from "../../../../../ks-lib/src/lib/services/projects/project.service";
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {TopicService} from "../../../../../ks-lib/src/lib/services/topics/topic.service";

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
              private projectService: ProjectService,
              private topicService: TopicService) {

    this.projectCreationForm = new FormGroup({
      name: new FormControl('', [
        Validators.pattern(/^[a-zA-Z0-9 _-]{3,64}$/),
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

  ngOnInit(): void {
    this.project.topics = [];

    if (this.data) {
      this.project.parentId = {value: this.data};
    }
  }

  create(): void {
    // TODO: validate project names (no blanks, etc.)
    console.log('Submitting form...', this.projectCreationForm);

    let name = (this.name?.value || '').trim();

    if (name.length > 0) {
      this.project.name = name;
      this.project.type = (this.type?.value || 'default');
      this.project.description = (this.description?.value || '');

      if (this.project.type === 'school') {
        let homework: ProjectCreationRequest = {
          authors: [], type: 'school',
          description: "Knowledge Canvas automatically generates sub-projects for 'school' type projects",
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
    console.log('Received topics: ', $event);

    this.project.topics = [...$event];
    // this.projectCreationForm.setValue({['topics']: [...$event]});
    // console.log('Set topics to: ', this.topics?.value)
  }

  onNameChange() {
    let name = (this.name?.value || '').trim();
    this.projectCreationForm.patchValue({['name']: name});


  }
}
