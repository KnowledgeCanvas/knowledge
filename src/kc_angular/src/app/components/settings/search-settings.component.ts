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
        <p-panel header="Provider">
          <ng-template pTemplate="content">
            <label for="search-dropdown">Select a provider</label>
            <p-dropdown [(ngModel)]="provider"
                        [options]="providers"
                        optionLabel="name"
                        [filter]="true"
                        id="search-dropdown"
                        [style]="{'width': '100%'}"
                        appendTo="body"
                        (onChange)="onProviderChange($event)">
            </p-dropdown>
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
}
