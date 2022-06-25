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
import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {ProjectService} from "../services/factory-services/project.service";
import {Observable, Subscription} from "rxjs";
import {KcProject} from "../models/project.model";
import {KnowledgeSource} from "../models/knowledge.source.model";
import {KcCardRequest} from "./project-components/project-calendar.component";
import {DataService} from "../services/user-services/data.service";
import {OverlayPanel} from "primeng/overlaypanel";
import {KsCommandService} from "../services/command-services/ks-command.service";

@Component({
  selector: 'app-calendar',
  template: `
    <div class="h-full surface-0 p-3">
      <div class="h-full w-full">
        <app-project-calendar [kcProject]="project | async"
                              [ksList]="ksList | async"
                              (onKsClick)="onKsClick($event)"
                              (onProjectClick)="onProjectClick($event)"
                              class="w-full h-full">
        </app-project-calendar>
      </div>
    </div>

    <p-overlayPanel #calendarOverlay>
      <app-ks-card *ngIf="selectedKs"
                   (onRemove)="onRemove($event)"
                   (onEdit)="onEdit($event)"
                   (onOpen)="onOpen($event)"
                   (onPreview)="onPreview($event)"
                   (onTopicClick)="onTopicClick($event)"
                   (onTopicChange)="onTopicChange($event)"
                   [ks]="selectedKs">
      </app-ks-card>
      <app-project-card *ngIf="selectedProject" [kcProject]="selectedProject"></app-project-card>
    </p-overlayPanel>
  `,
  styles: []
})
export class CalendarComponent implements OnInit, OnDestroy {
  @ViewChild('calendarOverlay') calendarOverlay!: OverlayPanel;

  projectId: string = '';

  ksList: Observable<KnowledgeSource[]>;

  project: Observable<KcProject | null>;

  selectedKs?: KnowledgeSource;

  selectedProject?: KcProject;

  subscription: Subscription;

  constructor(private command: KsCommandService,
              private data: DataService,
              private projects: ProjectService,
              private route: ActivatedRoute) {
    this.ksList = data.ksList;
    this.subscription = route.paramMap.subscribe((params) => {
      console.log('Calendar route param update: ', params);
      this.projectId = params.get('projectId') ?? '';
    })
    this.project = projects.currentProject;
    console.log('Calendar route: ', this.route);
    this.projectId = route.snapshot.params.projectId ?? '';
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  onKsClick($event: KcCardRequest) {
    if (!$event.ksId) {
      return;
    }

    this.calendarOverlay.hide();
    this.selectedKs = undefined;
    this.selectedProject = undefined;

    const subscription = this.ksList.pipe().subscribe((ks) => {
      const selected = ks.find(k => k.id.value === $event.ksId?.value);
      if (selected)
        this.selectedKs = selected;

      setTimeout(() => {
        this.calendarOverlay.show($event.event, $event.element);
        subscription.unsubscribe();
      })
    })


  }

  onProjectClick($event: KcCardRequest) {
    console.log('Project click: ', $event);
    if (this.calendarOverlay?.overlayVisible) {
      this.calendarOverlay.hide();
    }

    this.selectedKs = undefined;
    this.selectedProject = undefined;

    setTimeout(() => {
      this.calendarOverlay.show($event.event, $event.element);
      const project = this.projects.getProject($event.projectId ?? '')
      if (project) {
        this.selectedProject = project;
      }
    })
  }

  onRemove(ks: KnowledgeSource) {
    this.command.remove([ks])
  }
  onEdit(ks: KnowledgeSource) {
    this.command.detail(ks)
  }
  onOpen(ks: KnowledgeSource) {
    this.command.open(ks);
  }
  onPreview(ks: KnowledgeSource) {
    this.command.preview(ks);
  }
  onTopicClick($event: {ks: KnowledgeSource, topic: string}) {
    console.log('Need to search for topic: ', $event.topic);
  }
  onTopicChange(ks: KnowledgeSource) {
    // TODO: nothing is currently subscribed to this, so updates go unnoticed...
    this.command.update([ks]);
  }
}
