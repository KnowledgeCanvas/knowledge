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
import {Injectable, NgZone} from '@angular/core';
import {IpcMessage} from "../../../../../kc_shared/models/electron.ipc.model";
import {NotificationsService} from "../user-services/notifications.service";
import {BehaviorSubject, Observable} from "rxjs";
import {WebSourceModel} from "../../../../../kc_shared/models/web.source.model";
import {KnowledgeSource} from "../../models/knowledge.source.model";
import {KnowledgeSourceModel} from "../../../../../kc_shared/models/knowledge.source.model";

@Injectable({
  providedIn: 'root'
})
export class ExtensionService {
  private channels = {
    import: 'E2A:Extension:Import'
  }

  private receive = window.api.receive;

  private __links = new BehaviorSubject<Partial<WebSourceModel & KnowledgeSource>>({} as any);
  links: Observable<Partial<WebSourceModel & KnowledgeSource>> = this.__links.asObservable();


  constructor(private zone: NgZone, private notifications: NotificationsService) {
    this.receive(this.channels.import, (msg: IpcMessage) => {
      this.zone.run(() => {
        if (msg.success?.data) {
          console.log('Received data: ', msg.success.data);
          let topics, metadata;
          try {
            topics = JSON.parse(msg.success.data.topics);
          } catch (e) {
            console.log('Error parsing topics...', e);
          }

          try {
            metadata = JSON.parse(msg.success.data.metadata);
          } catch (e) {
            console.log('Error parsing metadata...', e);
          }

          notifications.debug('ExtensionService', 'Extension Import', msg.success.data.title);


          /* TODO: need to copy over other fields, like flagged, rawText, etc... but how? */
          /* TODO: standardize the model so we don't need to do a manual conversion */
          const webSource: Partial<WebSourceModel & KnowledgeSource> = {
            iconUrl: msg.success.data.iconUrl,
            title: msg.success.data.title,
            accessLink: msg.success.data.accessLink,
            topics: msg.success.data.topics ?? [],
            metadata: msg.success.data.metadata ?? {},
            flagged: msg.success.data.flagged,
            rawText: msg.success.data.rawText,
            thumbnail: msg.success.data.thumbnail,
            description: msg.success.data.description,
            markup: {notes: [], highlights: [], stickers: []}
          }

          if (msg.success.data.rawText) {
            webSource.markup = {
              notes: [{
                title: 'Selected Text',
                body: msg.success.data.rawText,
                type: 'highlight',
                event: {
                  timestamp: new Date().toLocaleString(),
                  type: 'create',
                  description: 'On Import.'
                }
              }]
            }
          }

          this.__links.next(webSource);
        } else {
          notifications.error('ExtensionService', 'Extension Import', msg.error?.message ?? 'Unable to import.')
          // TODO: subscriber.error(msg.error);
        }
      });
    })
  }


}
