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
import {ProjectModel} from "../../../../../shared/src/models/project.model";
import {ProjectService} from "../../../../../shared/src/services/projects/project.service";
import {MatAutocompleteSelectedEvent} from "@angular/material/autocomplete";
import {FormControl} from "@angular/forms";
import {Observable} from "rxjs";
import {map, startWith} from "rxjs/operators";

@Component({
  selector: 'app-project-topic-list',
  templateUrl: './project-topic-list.component.html',
  styleUrls: ['./project-topic-list.component.scss']
})
export class ProjectTopicListComponent implements OnInit, OnChanges {
  @Input() parentId: string | undefined;
  @Output() topicEvent = new EventEmitter<string[]>();
  @ViewChild('topicInput') topicInput: ElementRef<HTMLInputElement> | undefined;
  project: ProjectModel = {topics: []};
  selectable: boolean = false;
  removable: boolean = true;
  addOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  topics: Observable<string[]>;
  topicCtrl = new FormControl();
  allTopics: string[] = [];

  constructor(private topicService: TopicService, private projectService: ProjectService) {
    this.topicService.topics.subscribe((topics: TopicModel[]) => {
      for (let i = 0; i < topics.length; i++) {
        this.allTopics.push(topics[i].name);
      }
    });

    this.topics = this.topicCtrl.valueChanges.pipe(
      startWith(null), map((topic: string | null) => topic ? this._filter(topic) : this.allTopics.slice())
    );
  }

  ngOnChanges(changes: SimpleChanges) {
    let id = changes.parentId.currentValue;

    if (id) {
      let project = this.projectService.getProject(id);
      this.project = project ? project : {};
    }
  }

  ngOnInit(): void {

  }

  add($event: MatChipInputEvent): void {
    if ($event.value === '' || $event.value === ' ')
      return;

    const value = ($event.value).trim();

    console.log(`Adding chip: ${value}`);

    if (this.project.topics) {
      this.project.topics.push(value);
    } else {
      this.project.topics = [value];
    }

    this.topicEvent.emit(this.project.topics);

    // Clear the input value
    $event.chipInput!.clear();
  }

  remove(tag: string): void {
    if (this.project?.topics)
      this.project.topics = this.project.topics.filter(e => e !== tag);
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    if (this.project.topics)
      this.project.topics.push(event.option.viewValue);
    if (this.topicInput)
      this.topicInput.nativeElement.value = '';
    this.topicCtrl.setValue(null);
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.allTopics.filter(topic => topic.toLowerCase().includes(filterValue));
  }

}
