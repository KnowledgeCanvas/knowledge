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
import { BehaviorSubject, skip } from 'rxjs';
import { BrowserViewDialogService } from '@services/ipc-services/browser-view-dialog.service';
import { DialogService } from 'primeng/dynamicdialog';
import { Injectable, OnInit } from '@angular/core';
import { KsFactoryService } from '@services/factory-services/ks-factory.service';
import { SearchService } from '@services/user-services/search.service';
import { TopicModel } from '@shared/models/topic.model';
import { UuidService } from '@services/ipc-services/uuid.service';

@Injectable({
  providedIn: 'root',
})
export class TopicService implements OnInit {
  private _STORAGE_KEY = 'topic-service';

  private _ALL_TOPICS = this._STORAGE_KEY + '-all-topics';

  private _topics = new BehaviorSubject<TopicModel[]>([]);
  public readonly topics$ = this._topics.asObservable().pipe(skip(1));

  constructor(
    private _browser: BrowserViewDialogService,
    private _dialog: DialogService,
    private _factory: KsFactoryService,
    private _search: SearchService,
    private _uuid: UuidService
  ) {}

  ngOnInit(): void {
    this._load();
  }

  create(topic: string): TopicModel {
    const topics = this._topics.getValue();

    // Make sure the topic doesn't already exist
    const existing = topics.find((t) => t.label === topic);
    if (existing) {
      return existing;
    }

    // Otherwise create a new topic
    const id = this._uuid.generate(1)[0];
    const newTopic = { id, label: topic };

    // Add the topic to the list
    topics.push(newTopic);
    this._topics.next(topics);

    // Save the topics to local storage
    this._save();

    return newTopic;
  }

  read(topic: string): TopicModel | undefined {
    const topics = this._topics.getValue();
    return topics.find((t) => t.label === topic);
  }

  delete(topic: string) {
    // Find the index of the topic in the list
    const topics = this._topics.getValue();
    const index = topics.findIndex((t) => t.label === topic);
    if (index >= 0) {
      topics.splice(index, 1);
      this._topics.next(topics);
      this._save();
    }
  }

  search(term: string) {
    this._search.executeSearch(term);
  }

  private _save() {
    localStorage.setItem(
      this._ALL_TOPICS,
      JSON.stringify(this._topics.getValue())
    );
  }

  private _load() {
    const topicString = localStorage.getItem(this._ALL_TOPICS);
    if (topicString) {
      const topics = JSON.parse(topicString);
      this._topics.next(topics);
    }
  }
}
