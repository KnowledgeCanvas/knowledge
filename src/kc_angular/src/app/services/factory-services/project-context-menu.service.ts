/*
 * Copyright (c) 2023 Rob Royce
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import { Injectable } from '@angular/core';
import { KcProject } from '@app/models/project.model';
import { MenuItem, PrimeIcons } from 'primeng/api';
import { ProjectCommandService } from '@services/command-services/project-command.service';
import { ProjectService } from './project.service';

@Injectable({
  providedIn: 'root',
})
export class ProjectContextMenuService {
  constructor(
    private projects: ProjectService,
    private pCommand: ProjectCommandService
  ) {}

  generate(project: KcProject, projects?: KcProject[]): MenuItem[] {
    return [
      {
        label:
          project.name.substring(0, 16) +
          (project.name.length > 16 ? '...' : ''),
        disabled: true,
        icon: 'pi pi-folder',
      },
      {
        label: '',
        separator: true,
      },
      {
        label: 'Details',
        icon: PrimeIcons.INFO,
        command: () => {
          this.pCommand.detail(project);
        },
      },
      {
        label: 'Add Subproject',
        icon: PrimeIcons.PLUS,
        command: () => {
          this.pCommand.new(project.id);
        },
      },
      {
        label: '',
        separator: true,
      },
      {
        label: 'Goto Project',
        icon: PrimeIcons.ARROW_CIRCLE_RIGHT,
        command: () => {
          this.projects.setCurrentProject(project.id.value);
        },
      },
      {
        label: 'Copy as JSON',
        icon: PrimeIcons.COPY,
        command: () => {
          this.pCommand.copyJSON(projects ? projects : [project]);
        },
      },
      {
        label: '',
        separator: true,
      },
      {
        label: 'Remove',
        icon: PrimeIcons.TRASH,
        command: () => {
          this.pCommand.remove([project]);
        },
      },
    ];
  }
}
