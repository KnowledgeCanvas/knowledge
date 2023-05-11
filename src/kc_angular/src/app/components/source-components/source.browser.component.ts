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

import {
  Component,
  EventEmitter,
  HostListener,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import {
  BrowserViewClickEvent,
  BrowserViewConfig,
  BrowserViewNavEvent,
} from '@shared/models/browser.view.model';
import { KnowledgeSource } from '@app/models/knowledge.source.model';
import { ElectronIpcService } from '@services/ipc-services/electron-ipc.service';
import { BehaviorSubject, skip, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { Clipboard } from '@angular/cdk/clipboard';
import { NotificationsService } from '@services/user-services/notifications.service';
import { KsFactoryService } from '@services/factory-services/ks-factory.service';
import { IngestService } from '@services/ingest-services/ingest.service';

@Component({
  selector: 'source-browser',
  template: `
    <ks-lib-browser-view
      class="w-full h-full"
      *ngIf="browserViewConfig"
      (clickEvent)="onBrowserViewClickEvent($event)"
      (navEvent)="onBrowserViewNavEvent($event)"
      (textExtraction)="textExtraction($event)"
      [kcBrowserViewConfig]="browserViewConfig"
    >
    </ks-lib-browser-view>
    <div
      *ngIf="paused"
      class="h-full w-full flex-col-center-center overflow-hidden"
    >
      <div class="flex-col-center-center w-20rem h-20rem">
        <div class="text-4xl font-bold text-primary tracking-in-expand-fwd">
          Resizing
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        height: calc(100% - 7rem);
        width: 100%;
      }
    `,
  ],
})
export class SourceBrowserComponent implements OnInit, OnDestroy {
  @Output() update = new EventEmitter<KnowledgeSource>();

  @Output() chat = new EventEmitter<string>();

  source!: KnowledgeSource;

  browserViewConfig: BrowserViewConfig | undefined = undefined;

  paused = false;

  private activeUrl = '';

  private _windowResize = new BehaviorSubject<boolean>(false);

  windowResize$ = this._windowResize.asObservable();

  private subscribers: Subscription[] = [];

  constructor(
    private clipboard: Clipboard,
    private factory: KsFactoryService,
    private ingest: IngestService,
    private ipc: ElectronIpcService,
    private notify: NotificationsService
  ) {
    this.subscribers.push(
      this.windowResize$.pipe(skip(1), debounceTime(500)).subscribe(() => {
        this.start();
      })
    );
  }

  @HostListener('window:resize', ['$event'])
  windowResize() {
    this._windowResize.next(true);
    this.pause();
  }

  ngOnInit() {
    this.start();
  }

  ngOnDestroy() {
    this.ipc.closeBrowserView();
    this.subscribers.forEach((sub) => sub.unsubscribe());
  }

  start() {
    this.paused = false;
    setTimeout(() => {
      if (typeof this.source.accessLink === 'string') {
        this.browserViewConfig = {
          url: new URL(this.source.accessLink),
          isDialog: undefined,
        };
      } else {
        this.browserViewConfig = {
          url: this.source.accessLink,
          isDialog: undefined,
        };
      }
    });
  }

  pause() {
    // TODO: Hide the browser view instead of closing it
    this.ipc.closeBrowserView();
    this.browserViewConfig = undefined;
    this.paused = true;
  }

  onBrowserViewClickEvent(clickEvent: BrowserViewClickEvent) {
    if (!this.browserViewConfig) {
      this.notify.error(
        'Source Browser',
        'Invalid Configuration',
        'Expected browser view configuration.'
      );
      return;
    }

    if (clickEvent.copyClicked) {
      this.clipboard.copy(this.activeUrl);
    }

    if (clickEvent.saveClicked) {
      this.save();
    }

    if (clickEvent.openClicked) {
      window.open(this.activeUrl);
    }
  }

  onBrowserViewNavEvent(navEvent: BrowserViewNavEvent) {
    this.activeUrl = navEvent.url?.href || '';

    if (!this.browserViewConfig) return;

    if (navEvent.url?.href !== this.browserViewConfig.url.href) {
      this.browserViewConfig = {
        ...this.browserViewConfig,
        ...{ canSave: true },
      };
    } else {
      this.browserViewConfig = {
        ...this.browserViewConfig,
        ...{ canSave: undefined },
      };
    }
  }

  textExtraction(data: { url: string; text: string; method: string }) {
    const text = data.text.trim();
    switch (data.method) {
      case 'extract':
        if (
          text !== '' &&
          data.url.includes(
            typeof this.source.accessLink === 'string'
              ? this.source.accessLink
              : this.source.accessLink.href
          )
        ) {
          if (!this.source.description.includes(data.text)) {
            data.text = data.text.replace(/\n/g, '\n>');
            this.source.description += `${
              this.source.description ? '\n\n' : ''
            }## Note Extracted on ${new Date().toLocaleString()}\n>${
              data.text
            }\n`;
            this.update.emit(this.source);
          }
        }

        break;
      case 'summarize':
        this.chat.emit(
          `The following text was extracted from this Source. Please summarize it for me:\n${text}`
        );
        break;
      case 'topics':
        this.chat.emit(
          `The following text was extracted from this Source. Please list 4-5 topics (succinctly) that describe it:\n${text}`
        );
        break;
    }
  }

  private save() {
    this.factory
      .make('website', this.activeUrl)
      .then((ks) => {
        if (!ks) {
          this.notify.warn(
            'Preview',
            'Invalid Source',
            'Success was reported but the Source is undefined.'
          );
          return;
        }
        this.ingest.enqueue([ks]);
      })
      .catch((reason) => {
        this.notify.error('KsPreview', 'Invalid Import', reason);
      });
  }
}
