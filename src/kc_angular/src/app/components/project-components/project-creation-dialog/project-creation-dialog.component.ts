/**
 Copyright 2022 Rob Royce

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

import {Component, OnInit} from '@angular/core';
import {ProjectCreationRequest, ProjectType} from "src/app/models/project.model";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {ProjectService} from "../../../services/factory-services/project-service/project.service";


@Component({
  selector: 'app-project-creation-dialog',
  templateUrl: './project-creation-dialog.component.html',
  styleUrls: ['./project-creation-dialog.component.scss']
})

export class ProjectCreationDialogComponent implements OnInit {
  // A request, to be returned on form completion
  projectCreationRequest: ProjectCreationRequest;

  // The name of the parent project (if any)
  parentProjectName: string = 'None';

  // A list of potential project types
  projectTypes: { code: ProjectType, name: string }[];

  // Instance used during the creation process
  projectType: { code: ProjectType, name: string };

  constructor(private ref: DynamicDialogRef,
              private config: DynamicDialogConfig,
              private projectService: ProjectService) {
    this.projectTypes = projectService.ProjectTypes;
    this.projectType = this.projectTypes[0];
    this.projectCreationRequest = {
      authors: [],
      calendar: {events: [], start: null, end: null},
      description: "",
      knowledgeSource: [],
      name: "",
      parentId: config.data.parentId,
      subProjects: [],
      topics: [],
      type: 'default'
    }
  }

  ngOnInit(): void {
    if (this.projectCreationRequest.parentId?.value) {
      this.parentProjectName = this.projectService.getProject(
        this.projectCreationRequest.parentId.value)?.name ?? 'None';
    }
  }

  create(): void {
    if (this.projectCreationRequest.name.trim().length < 3) {
      return;
    }

    this.projectCreationRequest.type = this.projectType.code;
    console.debug('ProjectCreationDialog.create() | projectCreationRequest: ', this.projectCreationRequest);
    this.ref.close(this.projectCreationRequest);
  }
}
