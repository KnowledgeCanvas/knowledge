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

import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ProjectIdentifiers, ProjectService} from "../../../../../ks-lib/src/lib/services/projects/project.service";
import {ProjectModel} from "projects/ks-lib/src/lib/models/project.model";
import {MatAccordion} from "@angular/material/expansion";
import {KcCalendar} from "../../../../../ks-lib/src/lib/models/calendar.model";
import {Subscription} from "rxjs";
import {ProjectTopicListComponent} from "../project-topic-list/project-topic-list.component";

@Component({
  selector: 'app-canvas-details-overview',
  templateUrl: './project-details-overview.component.html',
  styleUrls: ['./project-details-overview.component.scss']
})
export class ProjectDetailsOverviewComponent implements OnInit, OnDestroy {
  @ViewChild('projectOverview', {static: true}) container!: ElementRef;
  @ViewChild('accordion', {static: true}) Accordion!: MatAccordion
  @ViewChild('topics', {static: true}) topics!: ProjectTopicListComponent;
  currentProject: ProjectModel = new ProjectModel('', {value: ''});
  notes: string[] = [];
  ancestors: ProjectIdentifiers[] = [];
  tooManyAncestorsToDisplay: boolean = false;
  private subscription: Subscription;

  constructor(private projectService: ProjectService) {
    this.subscription = projectService.currentProject.subscribe((project: ProjectModel) => {
      if (!project.calendar)
        project.calendar = new KcCalendar();
      this.currentProject = project;

      // Show up to 3 breadcrumbs (including current project)
      let ancestors = projectService.getAncestors(project.id.value);

      if (ancestors.length > 3) {
        this.ancestors = ancestors.slice(ancestors.length - 3);
        this.tooManyAncestorsToDisplay = true;
      } else {
        this.ancestors = ancestors;
        this.tooManyAncestorsToDisplay = false;
      }
    });
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  setDescription() {
    this.projectService.updateProject({id: this.currentProject.id});
  }

  openAll() {
    this.Accordion?.openAll();
  }

  closeAll() {
    this.Accordion?.closeAll();
  }

  setNotes() {
    this.projectService.updateProject({id: this.currentProject.id});
  }

  calStart($event: any) {
    if (this.currentProject.calendar) {
      this.currentProject.calendar.start = $event;
    } else {
      this.currentProject.calendar = new KcCalendar();
      this.currentProject.calendar.start = $event;
    }

    this.projectService.updateProject({id: this.currentProject.id});
  }

  calEnd($event: any) {
    if (this.currentProject.calendar) {
      this.currentProject.calendar.end = $event;
    } else {
      this.currentProject.calendar = new KcCalendar();
      this.currentProject.calendar.end = $event;
    }
    this.projectService.updateProject({id: this.currentProject.id});
  }

  navigate(id: string) {
    if (id !== this.currentProject.id.value)
      this.projectService.setCurrentProject(id);
  }
}
