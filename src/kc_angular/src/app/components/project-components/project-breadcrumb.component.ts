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
import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {ProjectService} from "../../services/factory-services/project.service";
import {MenuItem} from "primeng/api";
import {UUID} from "../../models/uuid";

@Component({
  selector: 'app-project-breadcrumb',
  template: `
    <p-breadcrumb [model]="breadcrumbs"
                  [home]="breadcrumbHeader"
                  styleClass="surface-ground h-full flex-row-center-start"
                  (onItemClick)="onBreadcrumbClick($event)"></p-breadcrumb>
  `,
  styles: []
})
export class ProjectBreadcrumbComponent implements OnChanges {
  @Input() projectId: string = '';

  @Output() onShowProjectTree = new EventEmitter<boolean>();

  breadcrumbs: MenuItem[] = [];

  breadcrumbHeader: MenuItem = {icon: 'pi pi-list', disabled: false, command: () => {
      this.onShowProjectTree.emit(true);
    }}

  constructor(private projects: ProjectService) {

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.projectId.currentValue) {
      this.setupBreadcrumbs({value: changes.projectId.currentValue});
    }
  }

  onBreadcrumbClick($event: any) {

  }

  setupBreadcrumbs(id: UUID) {
    let ancestors = this.projects.getAncestors(id.value);
    this.breadcrumbs = [];
    console.log('Got ancestors: ', ancestors);
    for (let ancestor of ancestors) {
      this.breadcrumbs.push({
        label: ancestor.title, id: ancestor.id, title: ancestor.title,
        items: [{label: ancestor.title, id: ancestor.id, title: ancestor.title,}]
      });
    }
  }

}
