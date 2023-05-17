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
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { KnowledgeSource } from '../models/knowledge.source.model';
import { DataService } from '@services/user-services/data.service';
import { KsCommandService } from '@services/command-services/ks-command.service';
import { KsFactoryService } from '@services/factory-services/ks-factory.service';
import { BrowserViewDialogService } from '@services/ipc-services/browser-view-dialog.service';
import { AutoComplete } from 'primeng/autocomplete';
import { KcProject } from '../models/project.model';
import { SearchService } from '@services/user-services/search.service';
import { take, takeUntil, tap } from 'rxjs/operators';
import { fadeIn } from '../animations';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-search',
  template: `
    <div class="p-inputgroup">
      <p-autoComplete
        #searchBar
        proTip
        tipHeader="Ready to Search? (⌘/Ctrl + F)"
        tipMessage="Start your search adventure right here! Find Sources within your Projects, or take a quick online detour with our built-in Chromium browser to search Google, Bing, or DuckDuckGo. Happy hunting!"
        [tipGroups]="['intro', 'navigation']"
        tipIcon="pi pi-search"
        [(ngModel)]="query"
        [suggestions]="suggestions"
        [showClear]="true"
        [minLength]="2"
        [scrollHeight]="'50vh'"
        appendTo="body"
        placeholder="🔍 Search"
        prefix="search"
        (completeMethod)="search(query)"
        (onSelect)="onSelect($event)"
        styleClass="lg:w-30rem md:w-24rem sm:w-auto"
        [style]="{ height: '28px' }"
        panelStyleClass="search-panel shadow-6"
      >
        <ng-template let-item pTemplate="item">
          <div class="flex-row-center-between border-200 w-full">
            <div class="flex-row-center-between w-full">
              <div class="flex-row-center-start">
                <div>
                  <app-ks-icon [ks]="item.item"></app-ks-icon>
                </div>
                <div class="m-1 flex flex-column h-full">
                  <b class="text-lg">{{ item.item.title | truncate : [92] }}</b>
                  <div class="text-500" *ngIf="item.item.associatedProject">
                    {{ item.item.associatedProject | projectBreadcrumb }}
                  </div>
                </div>
              </div>
              <div class="mr-2">
                <div
                  *ngIf="
                    item.item.id.value === 'search' && suggestions.length > 0
                  "
                >
                  <b *ngIf="suggestions.length === 1">No results</b>
                  <b *ngIf="suggestions.length > 1"
                    >{{ suggestions.length - 1 }} reult{{
                      suggestions.length > 2 ? 's' : ''
                    }}</b
                  >
                </div>
                <div
                  *ngIf="item.item.id.value !== 'search'"
                  class="h-full w-full flex-row-center-end"
                >
                  <div *ngIf="item.item.flagged">
                    <button
                      pButton
                      class="p-button-rounded p-button-sm"
                      icon="pi pi-flag"
                    ></button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            *ngIf="item.item.topics && item.item.topics.length > 0"
            class="flex-row-center-start overflow-x-auto pt-2 w-full mr-2"
          >
            <p-chips
              [allowDuplicate]="false"
              [addOnBlur]="false"
              [addOnTab]="false"
              [showClear]="false"
              [ngModel]="item.item.topics"
              class="p-fluid w-full"
            >
            </p-chips>
          </div>
          <p-divider
            *ngIf="item.item.id.value === 'search' && suggestions.length > 1"
            layout="horizontal"
          ></p-divider>
        </ng-template>
      </p-autoComplete>
      <div
        proTip
        tipHeader="Search Settings"
        tipMessage="Click here to change your search settings. You can choose your default search engine and fine tune your Source search results."
        [tipGroups]="['settings']"
        class="p-inputgroup-addon pi pi-sliders-h cursor-pointer"
        style="height: 28px"
        (click)="onSearchSettings()"
      ></div>
    </div>
  `,
  styles: [
    `
      ::ng-deep {
        .search-panel {
          width: min(100vw, 92rem) !important;
          position: absolute !important;
          left: 0 !important;
          right: 0 !important;
          margin: 0 auto;
        }

        .search-chip {
          background-color: var(--primary-color);
          color: var(--primary-color-text);
          height: 1.5rem;
        }
      }
    `,
  ],
  animations: [fadeIn],
})
export class SearchComponent implements OnInit, OnDestroy {
  @ViewChild('searchBar') searchBar!: AutoComplete;

  query: any;

  suggestions: Partial<KnowledgeSource & KcProject & any>[] = [];

  private cleanUp: Subject<any> = new Subject<any>();

  constructor(
    private data: DataService,
    private command: KsCommandService,
    private factory: KsFactoryService,
    private browser: BrowserViewDialogService,
    private _search: SearchService
  ) {}

  @HostListener('document:keydown.Control.f')
  @HostListener('document:keydown.meta.f')
  focusSearch() {
    this.searchBar.focusInput();
  }

  ngOnInit(): void {
    this._search.query
      .pipe(
        takeUntil(this.cleanUp),
        tap((term) => {
          if (term && term.trim().length > 0) {
            this.query = term;
            this.searchBar.search({}, term);

            setTimeout(() => {
              this.searchBar.focusInput();
              this.searchBar.show();
            });
          }
        })
      )
      .subscribe();
  }

  ngOnDestroy() {
    this.cleanUp.next({});
    this.cleanUp.complete();
  }

  search(query: string) {
    if (!query) {
      this.suggestions = [];
      return;
    }

    const provider = this._search.provider;

    this.suggestions = [];

    if (query.trim().length > 0) {
      this.suggestions.push({
        title: `Search ${provider.title} for: ${query}`,
        icon: provider.iconUrl,
        iconUrl: provider.iconUrl,
        id: { value: 'search' },
        query: query,
      });
    }

    this._search
      .forTerm(query)
      .pipe(
        take(1),
        tap((results: Partial<KnowledgeSource & KcProject & any>[]) => {
          if (results && results.length > 0) {
            this.suggestions = [
              {
                item: {
                  title: `Search ${provider.title} for: ${query}`,
                  icon: provider.iconUrl,
                  iconUrl: provider.iconUrl,
                  id: { value: 'search' },
                  query: query,
                },
              },
              ...results,
            ];
          } else {
            this.suggestions = [
              {
                item: {
                  title: `Search ${provider.title} for: ${query}`,
                  icon: provider.iconUrl,
                  iconUrl: provider.iconUrl,
                  id: { value: 'search' },
                  query: query,
                },
              },
            ];
          }
        })
      )
      .subscribe();
  }

  onSelect($event: {
    item: Partial<KnowledgeSource>;
    score: number;
    refIndex: number;
  }) {
    if ($event.item.id?.value === 'search') {
      const ks = this.factory.search(this.query.item.query ?? this.query ?? '');
      this.browser.open({ ks: ks });
    } else {
      this.command.detail($event.item as KnowledgeSource, true);
    }
    this.query = '';
  }

  onSearchSettings() {
    this._search.show();
  }
}
