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
import {ActivatedRoute} from "@angular/router";
import {ProjectService} from "../services/factory-services/project.service";
import {KcProject} from "../models/project.model";
import {ProjectTreeFactoryService} from "../services/factory-services/project-tree-factory.service";
import {Observable, Subscription} from "rxjs";

@Component({
  selector: 'app-projects',
  template: `
    <div class="h-full w-full flex flex-row surface-0" style="max-width: calc(100vw - 60px) !important; max-height: calc(100vh - 100px)">
      <div class="h-full max-h-screen flex flex-column flex-shrink-0 border-right-1 border-200">
        <p-tree class="h-full"
                styleClass="surface-ground"
                [style]="{'max-height': 'calc(100vh - 100px)'}"
                [filter]="true"
                [value]="projectTree"
                [(selection)]="selectProject"
                selectionMode="single"
                (selectionChange)="selectionChange($event)"
                scrollHeight="flex"></p-tree>
      </div>
      <div class="h-full flex flex-column flex-grow-1 overflow-y-auto" style="max-height: calc(100vh - 100px)">
        <div class="w-full flex flex-row flex-shrink-1">
          <app-project-card [kcProject]="kcProject | async" style="width: 100%"></app-project-card>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ProjectsComponent implements OnInit {
  projectId: string = '';

  projectTree: any[] = [];

  selectProject: any;

  kcProject: Observable<KcProject | null>;

  projectSub: Subscription;

  projectTreeSub: Subscription;

  constructor(private route: ActivatedRoute, private projects: ProjectService, private tree: ProjectTreeFactoryService) {
    this.kcProject = projects.currentProject;

    this.projectSub = route.paramMap.subscribe((params) => {
      this.projectId = params.get('projectId') ?? '';
      console.log('Project ID changed to: ', this.projectId);
      this.selectProject = tree.findTreeNode(this.projectTree, this.projectId);
    })

    this.projectTreeSub = projects.projectTree.subscribe((projectTree) => {
      this.projectTree = tree.constructTreeNodes(projectTree, true);
      this.selectProject = tree.findTreeNode(this.projectTree, this.projectId);
      console.log('Project tree is now: ', this.projectTree, this.selectProject);
    })
  }

  ngOnInit(): void {

  }

  onNodeSelect($event: any) {
    console.log('Project selected: ', $event);
  }

  selectionChange($event: any) {
    console.log('Selection change: ', $event);
    this.projects.setCurrentProject($event.key);
  }
}
