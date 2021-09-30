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

import {Injectable} from '@angular/core';
import {TopicModel} from 'projects/ks-lib/src/lib/models/topic.model';
import {UuidService} from '../uuid/uuid.service';
import {BehaviorSubject} from "rxjs";


@Injectable({
  providedIn: 'root'
})
export class TopicService {
  private topicSource = new BehaviorSubject<TopicModel[]>([]);
  public topics = this.topicSource.asObservable();

  constructor(private uuidService: UuidService) {
    let topicSource, topicSourceStr = window.localStorage.getItem('kc-topic-list');
    if (topicSourceStr) {
      topicSource = JSON.parse(topicSourceStr);
      if (topicSource)
        this.topicSource.next(topicSource);
    }
  }

  create(topicStr: string): TopicModel {
    let found = this.topicSource.value.find(t => t.name === topicStr);
    if (found)
      return found;
    let uuid = this.uuidService.generate(1)[0];
    let topic = new TopicModel(uuid, topicStr);
    let topicSource = [...this.topicSource.value, topic];
    topicSource = TopicService.sort(topicSource);

    // Persist to localStorage
    let topicSourceStr = JSON.stringify(topicSource);
    window.localStorage.setItem('kc-topic-list', topicSourceStr);

    // Update observable
    this.topicSource.next(topicSource);
    return topic;
  }

  exists(id: string): boolean {
    return this.topicSource.value.find(topic => topic.id.value === id) !== undefined;
  }

  find(topicStr: string): TopicModel | undefined {
    return this.topicSource.value.find(topic => topic.name === topicStr);
  }

  private static sort(topicList: TopicModel[]): TopicModel[] {
    topicList.sort((a, b) => {
      let x = a.name.toLowerCase();
      let y = b.name.toLowerCase();
      if (x < y) return -1;
      if (x > y) return 1;
      return 0;
    });
    return topicList;
  }
}
