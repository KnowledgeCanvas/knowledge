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
  ComponentRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  Type,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { SourceChatComponent } from '@components/source-components/source.chat.component';
import { SourceDetailsComponent } from '@components/source-components/source.details.component';
import { KnowledgeSource } from '@app/models/knowledge.source.model';
import { SourceMetadataComponent } from '@components/source-components/source.metadata.component';
import { PrimeIcons } from 'primeng/api';
import { SourceDocumentComponent } from '@components/source-components/source.document.component';
import { SourceVideoComponent } from '@components/source-components/source.video.component';
import { SourceTimelineComponent } from './source.timeline.component';
import { ChatService } from '@services/chat-services/chat.service';
import { NotificationsService } from '@services/user-services/notifications.service';
import { SourceBrowserComponent } from '@components/source-components/source.browser.component';

interface TabDescriptor {
  label: string;
  icon: PrimeIcons;
  hidden: boolean;
  disabled: boolean;
  loading: boolean;
  component: Type<any>;
}

@Component({
  selector: 'app-source',
  template: `
    <div class="tabs">
      <div
        class="tab text-center flex-row-center-center border-round-top-2xl font-bold"
        *ngFor="let tab of tabs; index as i"
        [ngClass]="{
          active: selectedTabIndex === i,
          disabled: tab.disabled,
          hidden: tab.hidden
        }"
        (click)="setSelectedTab(i)"
      >
        <i class="{{ tab.icon }} pr-2"></i>
        <span>{{ tab.label }}</span>
        <p-progressSpinner
          *ngIf="tab.loading"
          class="pl-2"
          styleClass="w-1rem h-1rem"
        ></p-progressSpinner>
      </div>
    </div>

    <ng-container #tabContainer></ng-container>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        height: 100%;
        width: 100%;
      }

      .tabs {
        display: flex;
        width: 100%;
        padding-left: 0.25rem !important;
        padding-right: 0.25rem !important;
      }

      .tab {
        flex: 1;
        padding: 10px;
        cursor: pointer;
        background-color: var(--surface-ground);
      }

      .tab:not(.active) {
        background-color: var(--surface-a);
      }

      .tab.active {
        color: var(--primary-color);
        border-bottom: 1px solid var(--primary-color);
        background-color: var(--surface-card) !important;
      }

      .tab.disabled {
        cursor: not-allowed;
        opacity: 0.5;

        @media (max-width: 1000px) {
          display: none;
        }
      }
    `,
  ],
})
export class SourceComponent implements OnInit, OnChanges {
  @ViewChild('tabContainer', { read: ViewContainerRef, static: true })
  tabContainer!: ViewContainerRef;

  detailsTab: TabDescriptor = {
    label: 'Details',
    icon: PrimeIcons.INFO_CIRCLE,
    hidden: false,
    disabled: false,
    loading: false,
    component: SourceDetailsComponent,
  };

  chatTab: TabDescriptor = {
    label: 'Chat',
    icon: PrimeIcons.COMMENTS,
    hidden: false,
    disabled: false,
    loading: false,
    component: SourceChatComponent,
  };

  timelineTab: TabDescriptor = {
    label: 'Timeline',
    icon: PrimeIcons.CALENDAR,
    hidden: true,
    disabled: true,
    loading: false,
    component: SourceTimelineComponent,
  };

  browserTab: TabDescriptor = {
    label: 'Browser',
    icon: PrimeIcons.GLOBE,
    hidden: false,
    disabled: false,
    loading: false,
    component: SourceBrowserComponent,
  };

  documentTab: TabDescriptor = {
    label: 'Document',
    icon: PrimeIcons.FILE,
    hidden: false,
    disabled: true,
    loading: false,
    component: SourceDocumentComponent,
  };

  videoTab: TabDescriptor = {
    label: 'Video',
    icon: PrimeIcons.YOUTUBE,
    hidden: false,
    disabled: true,
    loading: false,
    component: SourceVideoComponent,
  };

  metadataTab: TabDescriptor = {
    label: 'Metadata',
    icon: PrimeIcons.HASHTAG,
    hidden: false,
    disabled: false,
    loading: false,
    component: SourceMetadataComponent,
  };

  tabs: TabDescriptor[] = [
    this.detailsTab,
    this.chatTab,
    this.timelineTab,
    this.browserTab,
    this.documentTab,
    this.videoTab,
    this.metadataTab,
  ];

  selectedTabIndex = 0;

  @Input() source!: KnowledgeSource;

  @Input() dialog = false;

  @Input() reset = false;

  @Output() remove = new EventEmitter<KnowledgeSource>();

  @Output() update = new EventEmitter<KnowledgeSource>();

  private componentRef?: ComponentRef<any>;

  constructor(
    private chat: ChatService,
    private notify: NotificationsService
  ) {}

  ngOnInit() {
    this.loadSelectedTab();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.source) {
      this.views(changes.source.currentValue);
      this.loadSelectedTab();
    }

    if (changes.reset && changes.reset.currentValue) {
      if (this.selectedTabIndex !== 0) {
        this.setSelectedTab(0);
      }
    }
  }

  views(source: KnowledgeSource) {
    // Metadata is disabled if no metadata exists
    this.metadataTab.disabled =
      !this.source.reference.source.website?.metadata?.meta;

    // If video, enable video tab and disable document tab
    if (source.ingestType === 'website') {
      source.accessLink = new URL(source.accessLink);
      this.documentTab.disabled = this.documentTab.hidden = true;

      if (
        source.accessLink.hostname === 'www.youtube.com' &&
        source.accessLink.searchParams.get('v')
      ) {
        this.browserTab.disabled = this.browserTab.hidden = false;
        this.videoTab.disabled = this.videoTab.hidden = false;
        return;
      } else {
        this.browserTab.disabled = this.browserTab.hidden = false;
        this.videoTab.disabled = this.videoTab.hidden = true;
        return;
      }
    } else if (source.ingestType === 'file') {
      this.browserTab.disabled = this.browserTab.hidden = true;
      this.videoTab.disabled = this.videoTab.hidden = true;
      this.documentTab.disabled = this.documentTab.hidden = true;

      // If document, enable document table and disable video tab
      const fileType = source.reference.source.file?.type;
      if (
        `${source.accessLink}`.endsWith('pdf') ||
        `${source.accessLink}`.endsWith('gif') ||
        `${source.accessLink}`.endsWith('jpg')
      ) {
        this.documentTab.disabled = this.documentTab.hidden = false;
        return;
      }
    }
  }

  setSelectedTab(index: number) {
    // If the Chat tab is selected, make sure the API key has been setup. If not, prompt the user for API key.
    const handle = () => {
      if (!this.tabs[index].disabled) {
        this.selectedTabIndex = index;
        this.loadSelectedTab();
      }
    };

    if (this.tabs[index].label === 'Chat' && !this.chat.canChat()) {
      this.chat.getApiKeyDialog().subscribe((result: boolean) => {
        if (result) {
          handle();
        }
      });
    } else {
      handle();
    }
  }

  loadSelectedTab() {
    // TODO: can we preserve the view if it is still loading (e.g. for chat)? Currently the loading bar is reset with a pending chat request
    //   Should probably be done using angular router instead
    // Unload the existing view
    this.tabContainer.clear();

    // If the user is in a tab that has become disabled, switch to the first enabled tab
    if (this.tabs[this.selectedTabIndex].disabled) {
      this.selectedTabIndex = 0;
    }

    this.loadComponent(this.tabs[this.selectedTabIndex].component);
  }

  private loadComponent(component: Type<any>) {
    this.componentRef = this.tabContainer.createComponent(component);
    this.componentRef.instance.source = this.source;

    // Special handling for components with outputs and other special cases
    switch (component) {
      case SourceChatComponent:
        this.loadChat(this.componentRef);
        break;
      case SourceDetailsComponent:
        this.loadDetails(this.componentRef);
        break;
      case SourceBrowserComponent:
        this.loadBrowser(this.componentRef);
        break;
    }
  }

  private loadDetails(componentRef: ComponentRef<SourceDetailsComponent>) {
    componentRef.instance.remove.subscribe(() => {
      this.remove.emit(this.source);
    });
    componentRef.instance.update.subscribe((source: KnowledgeSource) => {
      this.source = source;
      this.update.emit(source);
    });
  }

  private loadChat(componentRef: ComponentRef<SourceChatComponent>) {
    componentRef.instance.loading$.subscribe((loading: boolean) => {
      setTimeout(() => {
        this.chatTab.loading = loading;
      });
    });
  }

  private loadBrowser(componentRef: ComponentRef<SourceBrowserComponent>) {
    componentRef.instance.update.subscribe((source: KnowledgeSource) => {
      this.source = source;
      this.update.emit(source);
    });

    componentRef.instance.chat.subscribe((message: string) => {
      const chatTabIndex = this.tabs.findIndex(
        (tab: TabDescriptor) => tab.label === 'Chat'
      );
      this.setSelectedTab(chatTabIndex);

      setTimeout(() => {
        this.componentRef?.instance.submit(message);
      }, 1500);
    });
  }
}
