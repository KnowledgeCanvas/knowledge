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

import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {ProjectModel} from "projects/ks-lib/src/lib/models/project.model";
import {ProjectService} from "../../../../../ks-lib/src/lib/services/projects/project.service";


@Component({
  selector: 'app-project-detail-viewport',
  templateUrl: './project-detail-viewport.component.html',
  styleUrls: ['./project-detail-viewport.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ProjectDetailViewportComponent implements OnInit {
  project: ProjectModel | null = null;

  constructor(private projectService: ProjectService) {
    this.project = null;

    this.projectService.currentProject.subscribe(project => {
      if (project.id.value.trim() !== '')
        this.project = project;
      else
        this.project = null;
    });
  }

  ngOnInit(): void {
  }
}
