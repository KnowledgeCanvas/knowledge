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

import {Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild} from '@angular/core';
import {COMMA} from "@angular/cdk/keycodes";
import {TopicService} from "../../../../../ks-lib/src/lib/services/topics/topic.service";
import {MatChipInput, MatChipInputEvent} from "@angular/material/chips";
import {ProjectModel, ProjectUpdateRequest} from "projects/ks-lib/src/lib/models/project.model";
import {ProjectService} from "../../../../../ks-lib/src/lib/services/projects/project.service";
import {MatAutocompleteSelectedEvent} from "@angular/material/autocomplete";
import {FormControl} from "@angular/forms";
import {Observable, Subscription} from "rxjs";
import {map, startWith} from "rxjs/operators";
import {TopicModel} from "projects/ks-lib/src/lib/models/topic.model";
import {KsQueueService} from "../../knowledge-source/ks-queue-service/ks-queue.service";
import {BrowserViewDialogService} from "../../../../../ks-lib/src/lib/services/browser-view-dialog/browser-view-dialog.service";
import {SettingsService} from "../../../../../ks-lib/src/lib/services/settings/settings.service";
import {KsFactoryService} from "../../../../../ks-lib/src/lib/services/ks-factory/ks-factory.service";
import {MatDialog} from "@angular/material/dialog";

@Component({
  selector: 'app-project-topic-list',
  templateUrl: './project-topic-list.component.html',
  styleUrls: ['./project-topic-list.component.scss']
})
export class ProjectTopicListComponent implements OnInit, OnChanges, OnDestroy {
  @Input() kcComponentType: 'project' | 'ks' | 'new' | undefined = undefined;

  @Output() topicAdded = new EventEmitter<string[]>();

  @ViewChild(MatChipInput, {static: false}) matChipInput: MatChipInput | undefined;

  project: ProjectModel = new ProjectModel('', {value: ''}, 'default');

  selectable: boolean = true;

  removable: boolean = true;

  readonly separatorKeysCodes = [COMMA] as const

  topicInput: FormControl = new FormControl();

  filteredTopics: Observable<string[]>;

  topics: string[] = [];

  allTopics: string[] = [];

  private subscription: Subscription;

  constructor(private topicService: TopicService,
              private browserViewDialogService: BrowserViewDialogService,
              private settingsService: SettingsService,
              private searchService: KsQueueService,
              private ksFactory: KsFactoryService,
              private dialog: MatDialog,
              private projectService: ProjectService) {
    this.subscription = this.projectService.currentProject.subscribe((project) => {
      this.project = project;
      this.topics = project.topics ? project.topics : [];
    });

    this.topicService.topics.subscribe((topics: TopicModel[]) => {
      this.allTopics = [];
      for (let topic of topics)
        this.allTopics.push(topic.name);
    });

    this.filteredTopics = this.topicInput.valueChanges.pipe(
      startWith(null),
      map((topic: string | null) => topic ? this.filter(topic) : this.allTopics.slice()));
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!changes.kcComponentType?.currentValue) {
      console.warn('Topic List - Unexpected Input');
      this.topics = [];
    }
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  add(input: MatChipInputEvent | string): void {
    let value;

    if (typeof input === 'string') {
      value = input.trim();
    } else {
      value = (input.value || '').trim();
    }

    if (this.topics.includes(value) || value === '') {
      this.resetInput();
      return;
    }

    this.topics.push(value);

    if (!this.kcComponentType) {
      this.topicAdded.emit(this.topics);
    } else {
      this.updateProject();
    }

    this.createTopic(value);

    this.resetInput();
  }

  remove(topic: string): void {
    const index = this.topics.indexOf(topic);
    if (index >= 0) {
      this.topics.splice(index, 1);
      if (this.kcComponentType)
        this.updateProject();
    }
  }

  resetInput() {
    if (this.matChipInput) {
      this.matChipInput.clear();
    }
    this.filteredTopics = this.topicInput.valueChanges.pipe(
      startWith(null),
      map((topic: string | null) => topic ? this.filter(topic) : this.allTopics.slice()));
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.add(event.option.viewValue);
  }

  topicClicked(topic: string) {
    let ks = this.ksFactory.searchKS(topic);
    this.browserViewDialogService.open({ks: ks});
  }

  private filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.allTopics.filter(topic => topic.toLowerCase().includes(filterValue));
  }

  private updateProject() {
    let update: ProjectUpdateRequest = {
      id: this.project.id,
      overWriteTopics: this.topics
    }
    this.projectService.updateProject(update);
  }

  private createTopic(topic: string) {
    this.topicService.create(topic);
  }
}

