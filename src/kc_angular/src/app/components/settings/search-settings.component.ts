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

import {Component, OnDestroy, OnInit} from '@angular/core';
import {SettingsService} from "../../services/ipc-services/settings.service";
import {Subscription} from "rxjs";


@Component({
  selector: 'app-search-settings',
  template: `
    <div class="p-fluid grid">
      <div class="col-12">
        <p-panel>
          <ng-template pTemplate="header">
            <div class="flex-row-center-between w-full">
              <div>
                <b>Search Provider</b>
              </div>
            </div>
          </ng-template>
          <ng-template pTemplate="content">
            <div class="w-full h-full grid">
              <div class="col-12 mt-4 w-full">
                <label for="search-dropdown">Select a provider</label>
                <p-dropdown [(ngModel)]="provider"
                            [options]="providers"
                            optionLabel="name"
                            [filter]="true"
                            inputId="search-dropdown"
                            [style]="{'width': '100%'}"
                            appendTo="body"
                            (onChange)="onProviderChange($event)">
                </p-dropdown>
              </div>
            </div>
          </ng-template>
        </p-panel>
      </div>

      <div class="col-12">
        <p-panel>
          <ng-template pTemplate="header">
            <div class="flex-row-center-between w-full">
              <div>
                <b>Local Search</b>
              </div>
            </div>
          </ng-template>
          <ng-template pTemplate="content">
            <div class="w-full h-full grid">
              <div class="col-8 flex flex-column">
                <div class="flex-row-center-start">
                  <label for="search-fuzzy">Fuzzy Matching</label>
                </div>
                <p-inputSwitch inputId="search-fuzzy" [(ngModel)]="fuzzy"
                               (onChange)="onFuzzyChange($event)">
                </p-inputSwitch>
                <div class="flex-row-center-start text-500">
                  <div *ngIf="fuzzy">
                    Match based on threshold
                    <a class="pl-2" target="_blank" href="https://fusejs.io/concepts/scoring-theory.html">
                      Learn more
                    </a>
                  </div>
                  <div *ngIf="!fuzzy">
                    Match entire search term
                  </div>
                </div>
              </div>
              <div class="col-4 flex flex-column">
                Threshold (default: 0.5)
                <input type="text"
                       pInputText
                       [disabled]="!fuzzy"
                       ngModel="{{threshold | searchThreshold}}"
                       readonly/>
                <p-slider [(ngModel)]="threshold"
                          (onSlideEnd)="onThresholdChange($event)"
                          [disabled]="!fuzzy">
                </p-slider>
              </div>
            </div>
          </ng-template>
        </p-panel>
      </div>
    </div>
  `,
  styles: []
})
export class SearchSettingsComponent implements OnInit, OnDestroy {
  // Search provider (Google by default)
  provider = {code: 'google', name: 'Google'};

  // Valid search provider selections
  providers = [
    {code: 'google', name: 'Google'},
    {code: 'bing', name: 'Bing'},
    {code: 'duck', name: 'DuckDuckGo'}
  ]
  fuzzy: boolean = false;
  threshold: number = 50;
  private readonly _searchSubscription: Subscription;

  constructor(private settingsService: SettingsService) {
    this._searchSubscription = settingsService.search.subscribe((searchSettings) => {
      if (!searchSettings.provider) {
        return;
      }
      let provider = this.providers.find(p => p.code === searchSettings.provider);
      if (provider) {
        this.provider = provider;
      }

      if (searchSettings.fuzzy === undefined) {
        settingsService.set({search: {fuzzy: false}});
      } else {
        this.fuzzy = searchSettings.fuzzy;
      }

      if (searchSettings.threshold === undefined) {
        settingsService.set({search: {threshold: 50}});
      } else {
        this.threshold = searchSettings.threshold;
      }
    });
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    if (this._searchSubscription) {
      this._searchSubscription.unsubscribe();
    }
  }

  onProviderChange($event: any) {
    if (!$event.value) {
      console.warn('SearchSettings: provider change unsuccessful, value unknown.');
      return;
    }
    let provider = this.providers.find(p => p.code === $event.value.code);
    if (provider) {
      this.settingsService.set({search: {provider: $event.value.code}});
    } else {
      console.warn('SearchSettings: provider change unsuccessful, invalid value');
    }
  }

  onFuzzyChange($event: any) {
    if ($event.checked !== undefined) {
      this.settingsService.set({
        search: {
          fuzzy: $event.checked,
          threshold: $event.checked ? 50 : 0
        }
      });
    }
  }

  onThresholdChange($event: any) {
    if ($event.value === undefined) {
      return;
    }

    let threshold = $event.value;
    if (threshold >= 0 && threshold <= 100) {
      this.settingsService.set({search: {threshold: threshold}});
    }
  }
}
