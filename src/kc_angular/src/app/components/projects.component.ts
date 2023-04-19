/*
 * Copyright (c) 2022-2023 Rob Royce
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
import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {ProjectService} from "@services/factory-services/project.service";
import {KcProject} from "../models/project.model";
import {BehaviorSubject, Subject, tap} from "rxjs";
import {ContextMenu} from "primeng/contextmenu";
import {MenuItem} from "primeng/api";
import {takeUntil} from "rxjs/operators";
import {DataService} from "@services/user-services/data.service";
import {KnowledgeSource} from "../models/knowledge.source.model";
import {TopicService} from "@services/user-services/topic.service";

@Component({
  selector: 'app-projects',
  template: `
    <div class="width-constrained w-full h-full flex flex-column gap-2 p-4">
      <div class="project-details">
        <app-project-info class="w-full" [project]="project | async"></app-project-info>
      </div>

      <div class="source-topics">
        <p-card header="Top-20 Topics">
          <ng-template pTemplate="content">
            <p-chips [ngModel]="topics.asObservable() | async"
                     class="w-full p-fluid"
                     [allowDuplicate]="false"
                     (onChipClick)="onTopicClick($event)"
            ></p-chips>
          </ng-template>
        </p-card>
      </div>

    </div>
    <p-contextMenu #cm
                   styleClass="shadow-7"
                   [model]="menuItems"
                   [baseZIndex]="999999"
                   [autoZIndex]="true"
                   appendTo="body">
    </p-contextMenu>
  `,
  styles: [
    `
      ::ng-deep {
        ul.p-inputtext.p-chips-multiple-container {
          gap: 0.25rem;
        }
      }
    `
  ]
})
export class ProjectsComponent implements OnInit, OnDestroy {
  @ViewChild('cm') cm!: ContextMenu;

  projectId: string = '';

  project: BehaviorSubject<KcProject | null> = new BehaviorSubject<KcProject | null>(null);

  data: any[] = [];

  menuItems: MenuItem[] = [];

  topics = new BehaviorSubject<String[]>([]);

  private cleanUp: Subject<any> = new Subject<any>();

  constructor(private route: ActivatedRoute,
              private projects: ProjectService,
              private dataService: DataService,
              private topicService: TopicService) {
    route.params.pipe(
      takeUntil(this.cleanUp),
      tap((params) => {
        this.projectId = params.projectId ?? '';

        const project = projects.getProject(this.projectId) ?? null;
        if (project) {
          this.project.next(project);
        }

        if (this.projectId !== projects.getCurrentProjectId()?.value) {
          this.projects.setCurrentProject(this.projectId);
        }
      })
    ).subscribe();

    dataService.ksList.pipe(
      takeUntil(this.cleanUp),
      tap((sources: KnowledgeSource[]) => {
        let topics: string[] = [];

        sources.forEach((ks) => {
          ks.topics?.forEach((topic) => {
            if (!topics.includes(topic)) {
              topics.push(topic);
            }
          });

          topics.sort((a, b) => {
            let nA = sources.filter(k => k.topics?.includes(a)).length;
            let nB = sources.filter(k => k.topics?.includes(b)).length;
            return (nA < nB) ? 1 : (nA > nB) ? -1 : 0;
          })
        })

        this.topics.next(topics.slice(0, 19));

      })
    ).subscribe()
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.cleanUp.next({});
    this.cleanUp.complete();
    this.project.complete();
  }

  onTopicClick($event: any) {
    if ($event && $event.value !== undefined) {
      this.topicService.search($event.value);
    }
  }
}
