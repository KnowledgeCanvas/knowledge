import {Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild} from '@angular/core';
import {COMMA, ENTER} from "@angular/cdk/keycodes";
import {TopicService} from "../../../../../ks-lib/src/lib/services/topics/topic.service";
import {MatChipInputEvent} from "@angular/material/chips";
import {ProjectModel, ProjectUpdateRequest} from "projects/ks-lib/src/lib/models/project.model";
import {ProjectService} from "../../../../../ks-lib/src/lib/services/projects/project.service";
import {MatAutocompleteSelectedEvent, MatAutocompleteTrigger} from "@angular/material/autocomplete";
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
  @Input() kcComponentType: 'project' | 'ks' | undefined = undefined;

  @Input() list: string[] | undefined = undefined;

  @Output() change = new EventEmitter<string[]>();

  @ViewChild(MatAutocompleteTrigger, {static: true}) trigger: MatAutocompleteTrigger | undefined;

  project: ProjectModel = new ProjectModel('', {value: ''}, 'default');

  selectable: boolean = false;

  removable: boolean = true;

  readonly separatorKeysCodes = [ENTER, COMMA] as const;

  topicInput = new FormControl();

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
      map((topic: string | null) => topic ? this._filter(topic) : this.allTopics.slice()));
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!changes.sourceRef.currentValue) {
      this.topics = [];
    }
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    if (value && !this.topics.includes(value)) {
      this.topics.push(value);

      // If no source reference is provided,
      if (!this.kcComponentType) {
        this.change.emit(this.topics);
      } else {
        this.updateProject();
      }

      this.createTopic(value);
    }

    this.topicInput.setValue(null);

    this.trigger?.openPanel();
  }

  remove(topic: string): void {
    const index = this.topics.indexOf(topic);
    if (index >= 0) {
      this.topics.splice(index, 1);
      if (this.kcComponentType)
        this.updateProject();
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    if (!this.topics.includes(event.option.viewValue)) {
      this.topics.push(event.option.viewValue);

      if (!this.kcComponentType)
        this.change.emit(this.topics);
      else
        this.updateProject();

    }

    this.topicInput.setValue(null);

    this.trigger?.openPanel();
  }

  topicClicked(topic: string) {
    let ks = this.ksFactory.searchKS(topic);
    this.browserViewDialogService.open({ks: ks});
  }

  onFocus() {
    this.trigger?._onChange('');
    this.trigger?.openPanel();
  }

  private _filter(value: string): string[] {
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

