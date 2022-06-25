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
import {Component, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {KnowledgeSource} from "../models/knowledge.source.model";
import {DataService} from "../services/user-services/data.service";
import {KsCommandService} from "../services/command-services/ks-command.service";
import {StorageService} from "../services/ipc-services/storage.service";
import {FaviconService} from "../services/ingest-services/favicon.service";
import {KsFactoryService} from "../services/factory-services/ks-factory.service";
import {BrowserViewDialogService} from "../services/ipc-services/browser-view-dialog.service";
import {SettingsService} from "../services/ipc-services/settings.service";
import {SearchSettingsModel} from "../../../../kc_shared/models/settings.model";
import {AutoComplete} from "primeng/autocomplete";
import {KcProject} from "../models/project.model";

@Component({
  selector: 'app-search',
  template: `
    <p-autoComplete [(ngModel)]="query"
                    [suggestions]="suggestions"
                    [field]="'title'"
                    #searchBar
                    (completeMethod)="search(query, $event)"
                    (onSelect)="onSelect($event)"
                    (onClear)="onClear($event)"
                    (onDropdownClick)="onDropdownClick($event)"
                    styleClass="w-30rem">
      Something else
      <ng-template let-item pTemplate="item">
        <div class="flex-row-center-start border-200" [class.border-bottom-1]="item.id.value === 'search'">
          <app-ks-icon [ks]="item"></app-ks-icon>
          <div class="m-4">{{item.title}}</div>
        </div>
      </ng-template>
    </p-autoComplete>
  `,
  styles: [
    `
    `
  ]
})
export class SearchComponent implements OnInit, OnDestroy {
  @ViewChild('searchBar') searchBar!: AutoComplete;
  searchSettings?: SearchSettingsModel;
  query: any;
  suggestions: Partial<KnowledgeSource & KcProject & any>[] = [];
  active: KnowledgeSource[] = [];
  all: KnowledgeSource[] = [];

  constructor(private data: DataService,
              private command: KsCommandService,
              private factory: KsFactoryService,
              private browser: BrowserViewDialogService,
              private storage: StorageService,
              private settings: SettingsService,
              private favicon: FaviconService) {
    settings.search.subscribe((settings) => {
      this.searchSettings = settings;
    })

    // TODO: this only gets updated once, which makes it inconsistent over time
    //        ideally it should be an observer (data.ksList is the /active/ ksList, not /all/ ks)
    storage.ksList().then((ksList) => {
      if (ksList) {
        favicon.extractFromKsList(ksList).then((all) => {
          this.all = all;
        })
      }
    })

    data.ksList.subscribe((ksList) => {
      console.log('Search bar got new KS list to search from: ', ksList);
      this.active = ksList;
    })
  }

  @HostListener('document:keydown.Control.f')
  @HostListener('document:keydown.meta.f')
  focusSearch() {
    this.searchBar.focusInput()
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
  }

  search(query: string, $event: Event) {
    if (!query) {
      query = '';
    }
    console.log('Searching for: ', query, $event);

    const provider = this.searchSettings?.provider;

    this.suggestions = [
      {title: `Search Google for "${query}"`, icon: 'https://www.google.com/favicon.ico', iconUrl: 'https://www.google.com/favicon.ico', id: {value: 'search'}, query: query}
    ];

    // TODO: Also search for any projects here...
    for (let ks of this.all) {
      let ksStr = JSON.stringify(ks).toLocaleLowerCase();
      if (ksStr.includes(query?.toLocaleLowerCase())) {
        this.suggestions.push(ks);
      }
    }
  }

  onDropdownClick($event: any) {
    if ($event.query) {
      console.log('Dropdown clicked: ', $event);
      this.query = '';
    }

  }

  onClear($event: any) {
    if ($event.query) {
      console.log('Clear clicked: ', $event);
    }
  }

  onSelect($event: Partial<KnowledgeSource>) {
    console.log('Selected: ', $event)

    if ($event.id?.value === 'search') {
      console.log('Query is apparently: ', this.query);
      let ks = this.factory.searchKS(this.query.query ?? this.query ?? '');
      this.browser.open({ks: ks});
    } else {
      this.command.detail($event as KnowledgeSource);
    }
    this.query = '';
  }

  onPreview($event: MouseEvent, ks: Partial<KnowledgeSource & any>) {
    $event.preventDefault();
    console.log('Previewing ', ks);
  }
}
