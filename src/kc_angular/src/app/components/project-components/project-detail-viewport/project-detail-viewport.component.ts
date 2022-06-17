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


import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {KcProject} from "src/app/models/project.model";
import {ProjectService} from "../../../services/factory-services/project.service";
import {KnowledgeSource} from "../../../models/knowledge.source.model";
import {DialogService} from "primeng/dynamicdialog";
import {ProjectInfoComponent} from "../project-info/project-info.component";
import {TreeNode} from "primeng/api";
import {UUID} from "../../../models/uuid";


@Component({
  selector: 'app-project-detail-viewport',
  templateUrl: './project-detail-viewport.component.html',
  styleUrls: ['./project-detail-viewport.component.scss'],
})
export class ProjectDetailViewportComponent implements OnInit {
  @Input() kcProject: KcProject | null = null;

  @Input() showProjectTree: boolean = false;

  @Input() treeNodes: TreeNode[] = [];

  @Input() selectedNode: any;

  @Output() ksDetails = new EventEmitter<KnowledgeSource>();

  @Output() ksRemove = new EventEmitter<KnowledgeSource[]>();

  @Output() ksPreview = new EventEmitter<KnowledgeSource>();

  @Output() onProjectCreation = new EventEmitter<UUID | undefined>();

  @Output() onProjectDeletion = new EventEmitter<UUID>();

  @Output() onTopicSearch = new EventEmitter<string>();

  @Output() onHide = new EventEmitter<boolean>();

  @Output() onShow = new EventEmitter();

  constructor(private browserViewDialogService: BrowserViewDialogService,
              private dialogService: DialogService,
              private projectService: ProjectService) {
  }

  get kcStyle() {
    return {
      height: 'calc(100vh - 55px)',
      width: '100%',
      flex: '1',
      display: 'flex',
      'flex-direction': 'row',
      'flex-wrap': 'nowrap',
      'align-content': 'stretch',
      'align-items': 'stretch',
      position: 'absolute'
    }
  }

  ngOnInit(): void {
  }

  ksAdded(_: KnowledgeSource[]) {
    if (!this.kcProject) {
      return;
    }
    // Since the KS has already been added to the project ks list, perform simple update
    let update: ProjectUpdateRequest = {
      id: this.kcProject.id
    }
    this.projectService.updateProjects([update]);
  }

  kcProjectUpdate(project: KcProject) {
    this.projectService.updateProjects([{
      id: project.id
    }])
  }

  kcSetCurrentProject($event: string) {
    this.projectService.setCurrentProject($event);
  }

  kcEditProject(id: UUID) {
    let project = this.projectService.getProject(id.value);
    if (!project) {
      console.error('Attempting to edit non-existent project.');
      return;
    }

    const original = JSON.stringify(project);

    const dialogref = this.dialogService.open(ProjectInfoComponent, {
      dismissableMask: true,
      data: {project: project}
    });

    dialogref.onClose.subscribe((_: any) => {
      if (project && JSON.stringify(project) !== original) {
        this.projectService.updateProjects([{
          id: project.id
        }]);
      }
    });
  }
}
