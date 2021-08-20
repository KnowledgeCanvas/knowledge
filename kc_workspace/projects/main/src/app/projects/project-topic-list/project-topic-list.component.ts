import {Component, ElementRef, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
import {COMMA, ENTER} from "@angular/cdk/keycodes";
import {TopicService} from "../../../../../shared/src/services/topics/topic.service";
import {MatChipInputEvent} from "@angular/material/chips";
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
export class ProjectTopicListComponent implements OnInit {
  @Output() topicEvent = new EventEmitter<string[]>();
  @ViewChild('topicInput') topicInput: ElementRef<HTMLInputElement> = {} as ElementRef;
  project: ProjectModel = new ProjectModel('', {value: ''}, 'default');

  selectable: boolean = false;
  removable: boolean = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  addOnBlur = true;

  topicCtrl = new FormControl();
  filteredTopics: Observable<string[]>;
  topics: string[] = [];
  allTopics: string[] = ['Computer Science', 'AI/ML'];

  constructor(private topicService: TopicService, private projectService: ProjectService) {
    this.projectService.currentProject.subscribe((project) => {
      console.log('Project changed to: ', project);
      this.project = project;
      // this.topics = project.topics ? project.topics : [];
    });


    // this.topicService.topics.subscribe((topics: TopicModel[]) => {
    //   for (let topic of topics)
    //     this.allTopics.push(topic.name);
    // });

    this.filteredTopics = this.topicCtrl.valueChanges.pipe(
      startWith(null),
      map((topic: string | null) => topic ? this._filter(topic) : this.allTopics.slice()));
  }


  ngOnInit(): void {
  }

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      this.topics.push(value);
    }
    event.chipInput!.clear();
    this.topicCtrl.setValue(null);
  }

  remove(topic: string): void {
    const index = this.topics.indexOf(topic);
    if (index >= 0) {
      this.topics.splice(index, 1);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.topics.push(event.option.viewValue);
    this.topicInput.nativeElement.value = '';
    this.topicCtrl.setValue(null);
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.allTopics.filter(topic => topic.toLowerCase().includes(filterValue));
  }

  private updateProject() {
  }
}

