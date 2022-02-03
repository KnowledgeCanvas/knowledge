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
import {BehaviorSubject} from "rxjs";
import {SearchModel} from "src/app/models/google.search.results.model";
import {FaviconExtractorService} from "../../../services/ingest-services/favicon-extraction-service/favicon-extractor.service";
import {KnowledgeSource} from "src/app/models/knowledge.source.model";
import {SettingsService} from "../../../services/ipc-services/settings-service/settings.service";
import {ExternalIngestService} from "../../../services/ingest-services/external-ingest/external-ingest.service";
import {NotificationsService} from "../../../services/user-services/notification-service/notifications.service";


@Injectable({
  providedIn: 'root'
})
export class KsQueueService {
  private ksQueueSubject = new BehaviorSubject<KnowledgeSource[]>([]);

  ksQueue = this.ksQueueSubject.asObservable();

  constructor(private faviconService: FaviconExtractorService,
              private settingsService: SettingsService,
              private externalIngestService: ExternalIngestService,
              private notificationsService: NotificationsService) {

    this.externalIngestService.ks.subscribe((ksList) => {
      this.enqueue(ksList);
    });
  }

  clearResults() {
    this.ksQueueSubject.next([]);
  }

  enqueue(ksList: KnowledgeSource[]) {
    let ksQueue = this.ksQueueSubject.value;
    ksQueue = ksQueue.concat(ksList);
    this.ksQueueSubject.next(ksQueue);

    this.notificationsService.toast({
      severity: 'success',
      summary: 'Up Next',
      detail: `${ksList.length} Knowledge Source${ksList.length > 1 ? 's' : ''} added!`,
      life: 3000
    });
  }

  remove(data: KnowledgeSource) {
    this.ksQueueSubject.next(this.ksQueueSubject.value.filter(ks => ks.id.value !== data.id.value));
  }

  shuffle(array: SearchModel[]): SearchModel[] {
    let currentIndex = array.length, randomIndex;

    // While there remain elements to shuffle...
    while (currentIndex != 0) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }

    return array;
  }
}
