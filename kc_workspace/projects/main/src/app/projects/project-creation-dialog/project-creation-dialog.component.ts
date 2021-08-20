import {Component, Inject, OnInit} from '@angular/core';
import {ProjectCreationRequest, ProjectModel} from "../../../../../shared/src/models/project.model";
import {ProjectService} from "../../../../../shared/src/services/projects/project.service";
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FormBuilder, FormGroup} from "@angular/forms";
import {UuidService} from "../../../../../shared/src/services/uuid/uuid.service";
import {TopicService} from "../../../../../shared/src/services/topics/topic.service";
import {TopicModel} from "../../../../../shared/src/models/topic.model";

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
  panelOpenState: boolean;
  private formGroup: FormGroup;

  constructor(private projectService: ProjectService,
              public dialogRef: MatDialogRef<ProjectCreationDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: string,
              formBuilder: FormBuilder,
              private uuidService: UuidService,
              private topicService: TopicService) {
    this.panelOpenState = false;
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
      if (this.project.type === 'school') {
        let homeworkTopic = this.topicService.find('Homework');
        let homework: ProjectCreationRequest = {
          authors: [],
          description: "The Knowledge Canvas automatically generated this folder based on the project type you chose!",
          knowledgeSource: [],
          name: "Homework",
          topics: homeworkTopic ? [homeworkTopic] : [],
          type: 'school'
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

  init(): void {
    this.project = new ProjectModel('', {value: ''}, 'default');

    if (this.data) {
      this.project.parentId = {value: this.data};
    }
  }


  addTopic($event: TopicModel[]) {
    this.project.topics = [...$event];
  }

  onFileSelected() {
  }
}
