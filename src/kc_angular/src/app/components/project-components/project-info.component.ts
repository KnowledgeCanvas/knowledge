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
import {Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {KcProject} from "@app/models/project.model";
import {EventService} from "@services/user-services/event.service";
import {FormBuilder, FormGroup} from "@angular/forms";
import {debounceTime, distinctUntilChanged, takeUntil, tap} from "rxjs/operators";
import {ProjectService} from "@services/factory-services/project.service";
import {NotificationsService} from "@services/user-services/notifications.service";
import {EventModel} from "@shared/models/event.model";
import {TopicService} from "@services/user-services/topic.service";
import {Subject} from "rxjs";


@Component({
  selector: 'app-project-info',
  template: `
    <div class="h-full w-full">
      <p-scrollPanel class="h-full w-full" [style]="{'max-height': '100%'}">
        <div>
          <p-panel *ngIf="project"
                   header="Details"
                   styleClass="w-full h-full"
                   [toggleable]="true"
                   [(collapsed)]="collapseAll">
            <ng-template pTemplate="content">
              <br>
              <form [formGroup]="form">
                <div class="p-fluid grid">
                  <div class="field p-float-label sm:col-12 md:col-12 lg:col-12 mb-5">
                    <input id="title"
                           type="text"
                           pInputText
                           required
                           minlength="3"
                           maxlength="64"
                           formControlName="name">
                    <label for="title">Title</label>
                    <div *ngIf="form.controls['name'].invalid && (form.controls['name'].dirty || form.controls['name'].touched)" class="p-error">
                      <div *ngIf="form.controls['name'].value.length < 3">
                        Must be between 3 and 64 characters
                      </div>
                      <div *ngIf="form.controls['name'].value.length > 64">
                        Must be 64 or fewer characters
                      </div>
                    </div>
                  </div>

                  <div class="field p-float-label sm:col-6 md:col-6 lg:col-6 mb-5">
                    <p-calendar formControlName="start"
                                [showTime]="true"
                                [showButtonBar]="true"
                                hourFormat="12"
                                [showIcon]="true"
                                id="start"
                                appendTo="body">
                    </p-calendar>
                    <label for="start">Start</label>
                  </div>

                  <div class="field p-float-label sm:col-6 md:col-6 lg:col-6 mb-5">
                    <p-calendar formControlName="end"
                                [showTime]="true"
                                [showButtonBar]="true"
                                hourFormat="12"
                                [showIcon]="true"
                                id="end"
                                appendTo="body">
                    </p-calendar>
                    <label for="end">End</label>
                  </div>

                  <div class="field p-float-label col-12 mb-5">
                    <textarea pInputTextarea
                              id="_ksDescription"
                              formControlName="description"
                              [autoResize]="true"
                              [rows]="4"
                              [cols]="30">
                    </textarea>
                    <label for="_ksDescription">Description</label>
                  </div>

                  <div class="field p-float-label sm:col-12 md:col-12 lg:col-12 mb-5">
                    <p-chips id="topics"
                             formControlName="topics"
                             class="p-fluid w-full"
                             [addOnBlur]="true"
                             [addOnTab]="true"
                             [allowDuplicate]="false"
                             (onChipClick)="onTopicClick($event)">
                    </p-chips>
                    <label for="topics">Topics</label>
                  </div>
                </div>
              </form>

              <div class="p-fluid grid">
                <div class="field p-float-label sm:col-6 md:col-6 lg:col-6 mb-5">
                  <input id="projectId" type="text" pInputText disabled
                         ngModel="{{project.id.value}}">
                  <label for="parentId">Project ID</label>
                </div>

                <div class="field p-float-label sm:col-6 md:col-6 lg:col-6 mb-5">
                  <input id="parentId" type="text" pInputText disabled
                         ngModel="{{project.parentId | projectName}}">
                  <label for="parentId">Parent Project</label>
                </div>

                <div class="field p-float-label sm:col-6 md:col-6 lg:col-6 mb-5">
                  <input id="type" type="text" pInputText disabled
                         ngModel="{{project.type | projectType}}">
                  <label for="type">Project Type</label>
                </div>
              </div>
            </ng-template>
          </p-panel>
        </div>
        <!--        TODO: Add project timeline-->
        <!--        TODO: Add list of sources-->
        <!--        TODO: Add charts with statistics-->
      </p-scrollPanel>
    </div>
  `,
  styles: []
})
export class ProjectInfoComponent implements OnInit, OnChanges, OnDestroy {
  @Input() project: KcProject | null = null;

  @Input() collapseAll: boolean = false;

  first: boolean = true;

  form: FormGroup;

  start: Date | null = null;

  end: Date | null = null;

  projectEvents: any[] = [];

  private cleanUp: Subject<any> = new Subject<any>();

  constructor(private events: EventService,
              private formBuilder: FormBuilder,
              private notifications: NotificationsService,
              private projects: ProjectService,
              private topics: TopicService) {

    this.form = formBuilder.group({
      id: '',
      name: [''],
      description: [''],
      start: [],
      end: [],
      topics: []
    });

    this.form.valueChanges.pipe(
      takeUntil(this.cleanUp),
      debounceTime(1000),
      distinctUntilChanged((prev, curr) => {
        if (curr.name.length < 3) {
          return true;
        }

        return (prev.name === curr.name &&
          prev.description === curr.description &&
          JSON.stringify(prev.topics) === JSON.stringify(curr.topics) &&
          prev.end === curr.end &&
          prev.start === curr.start
        );
      }),
      tap((formValue) => {
        if (this.first) {
          this.first = false;
        } else if (this.project) {
          if (!this.project.events) {
            this.project.events = [];
          }

          this.project.name = formValue.name;
          this.project.description = formValue.description;
          this.project.topics = formValue.topics;
          this.project.calendar.start = formValue.start;
          this.project.calendar.end = formValue.end;

          const event: EventModel = {
            description: "",
            timestamp: Date(),
            type: 'update'
          }
          this.project.events.push(event);

          this.projects.updateProjects([{
            id: this.project.id
          }]).then(() => {
            this.notifications.success('Project Info', 'Project Updated', this.project?.name ?? '');
          });
        }
      })
    ).subscribe();
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.cleanUp.next({});
    this.cleanUp.complete();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.project.currentValue) {
      const project = changes.project.currentValue;
      this.first = true;
      this.updateForm(project);
    }
  }

  updateForm(project: KcProject) {
    this.form.patchValue({
      id: project.id.value,
      name: project.name,
      start: project.calendar.start ? new Date(project.calendar.start) : '',
      end: project.calendar.end ? new Date(project.calendar.end) : '',
      description: project.description,
      topics: project.topics,
    });

    this.projectEvents = this.events.fromProject(project);

    if (typeof project.calendar.start === 'string') {
      this.start = new Date(project.calendar.start);
    } else {
      this.start = project.calendar.start;
    }

    if (typeof project.calendar.end === 'string') {
      this.end = new Date(project.calendar.end);
    } else {
      this.end = project.calendar.end;
    }
  }

  onTopicClick($event: any) {
    if ($event.value) {
      this.topics.search($event.value);
    }
  }
}
