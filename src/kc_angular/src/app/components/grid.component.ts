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
import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {KnowledgeSource} from "../models/knowledge.source.model";
import {DataService} from "../services/user-services/data.service";
import {ProjectService} from "../services/factory-services/project.service";
import {NotificationsService} from "../services/user-services/notifications.service";
import {KsCommandService} from "../services/command-services/ks-command.service";
import {TopicService} from "../services/user-services/topic.service";
import {first} from "rxjs/operators";

@Component({
  selector: 'app-grid',
  template: `
    <div class="h-full w-full flex-col-center-center">
      <div class="w-full h-full flex-col-center-between surface-section p-4" id="grid-container" [style]="{'max-width': 'min(100%, 192rem)'}">
        <app-ks-card-list class="h-full flex flex-row flex-grow-1"
                          [ksList]="ksList"
                          (onKsRemove)="onKsRemove($event)"
                          (onTopicSearch)="onTopicSearch($event)">
        </app-ks-card-list>
      </div>
    </div>
  `,
  styles: []
})
export class GridComponent implements OnInit {
  ksList: KnowledgeSource[] = [];

  constructor(private data: DataService,
              private activated: ActivatedRoute,
              private command: KsCommandService,
              private notifications: NotificationsService,
              private projects: ProjectService,
              private topics: TopicService,) {
    activated.params.subscribe((params) => {
      data.ksList.pipe(first()).subscribe((ksList) => {
        this.ksList = ksList;
      });
    })



  }

  ngOnInit(): void {
  }

  onKsRemove($event: KnowledgeSource) {
    this.command.remove([$event]);
  }

  onTopicSearch($event: string) {
    this.topics.search($event);
  }
}
