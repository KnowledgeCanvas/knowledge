import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {COMMA, ENTER} from "@angular/cdk/keycodes";
import {TopicService} from "../../../../../shared/src/services/topics/topic.service";
import {MatChipInputEvent} from "@angular/material/chips";
import {TopicModel} from "../../../../../shared/src/models/topic.model";
import {ProjectModel, ProjectUpdateRequest} from "../../../../../shared/src/models/project.model";
import {ProjectService} from "../../../../../shared/src/services/projects/project.service";
import {MatAutocompleteSelectedEvent} from "@angular/material/autocomplete";
import {FormControl} from "@angular/forms";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";

@Component({
  selector: 'app-project-topic-list',
  templateUrl: './project-topic-list.component.html',
  styleUrls: ['./project-topic-list.component.scss']
})
export class ProjectTopicListComponent implements OnInit, OnChanges {
  @Input() parentId: string | undefined;
  @Output() topicEvent = new EventEmitter<TopicModel[]>();
  @ViewChild('topicInput', {static: false}) topicInput: ElementRef<HTMLInputElement> = {} as ElementRef;

  project: ProjectModel = new ProjectModel('', {value: ''}, 'default');
  selectable: boolean = false;
  removable: boolean = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  addOnBlur = true;

  topicCtrl = new FormControl();
  filteredTopics: Observable<string[]>;
  allTopics: string[] = [];

  constructor(private topicService: TopicService, private projectService: ProjectService) {

    this.topicService.topics.subscribe((topics: TopicModel[]) => {
      console.log('Received new topic list: ', topics);
      for (let i = 0; i < topics.length; i++) {
        this.allTopics.push(topics[i].name);
      }
    });

    this.filteredTopics = this.topicCtrl.valueChanges.pipe(
      map((topic: string) => topic ? this._filter(topic) : this.allTopics.slice())
    );
  }

  ngOnChanges(changes: SimpleChanges) {
    let id = changes.parentId.currentValue;

    if (id) {
      let project = this.projectService.getProject(id);
      this.project = project ? project : new ProjectModel('', {value: ''}, 'default');
      console.log('Project in topics list: ', project);
    }
  }

  ngOnInit(): void {
  }

  add($event: MatChipInputEvent): void {
    console.log('Add event kicked off...', $event);

    const topicStr = ($event.value).trim();
    if (topicStr === '' || topicStr === ' ')
      return;

    console.log(`Adding chip: ${topicStr}`);

    let topic = this.topicService.find(topicStr);

    if (!topic)
      topic = this.topicService.create(topicStr)

    let update: ProjectUpdateRequest = {
      id: this.project.id,
      addTopic: [topic]
    }

    this.projectService.updateProject(update);

    this.topicEvent.emit(this.project.topics);

    // Clear the input value
    $event.chipInput!.clear();
  }

  remove(topic: TopicModel): void {
    console.log('Removing topic: ', topic.name);
    let update: ProjectUpdateRequest = {
      id: this.project.id,
      removeTopic: [topic]
    }
    this.projectService.updateProject(update);
    // if (this.project?.topics)
    //   this.project.topics = this.project.topics.filter(e => e.id !== topic.id);
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    console.log('Selected event kicked off... ', event);
    let topicStr = event.option.viewValue;
    let topic = this.topicService.find(topicStr);
    if (!topic)
      topic = this.topicService.create(topicStr)

    let update: ProjectUpdateRequest = {
      id: this.project.id,
      addTopic: [topic]
    }

    this.projectService.updateProject(update);
    this.topicInput.nativeElement.value = '';
    this.topicCtrl.setValue(null);
  }

  private _filter(topic: string): string[] {
    console.log('topic received: ', topic);
    const filtertopic = topic.toLowerCase();
    console.log('filtertopic: ', filtertopic);
    console.log('Returning allTpics: ', this.allTopics);
    return this.allTopics.filter(topic => topic.toLowerCase().includes(filtertopic));
  }

}
