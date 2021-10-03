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

import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {SettingsService} from "../../../../../ks-lib/src/lib/services/settings/settings.service";
import {MatSnackBar, MatSnackBarConfig} from "@angular/material/snack-bar";
import {SearchSettingsModel} from "../../../../../ks-lib/src/lib/models/settings.model";
import {FormControl} from "@angular/forms";
import {MatSelectChange} from "@angular/material/select";


@Component({
  selector: 'app-search-settings',
  templateUrl: './search-settings.component.html',
  styleUrls: ['./search-settings.component.scss']
})
export class SearchSettingsComponent implements OnInit, OnChanges {
  // Parent component should pass in the search settings so as to limit the number of SettingsService providers
  @Input() searchSettings: SearchSettingsModel = {};

  // Parent component should listen and update settings when they change
  @Output() settingsModified = new EventEmitter<SearchSettingsModel>();

  MIN_RESULTS = 1;
  MAX_RESULTS = 10;

  // Number of search results to display (so far limited to Google API callbacks)
  numResults = new FormControl(this.MAX_RESULTS);
  numResultsChanged: boolean = false;

  // Search provider (Google by default)
  provider = {value: 'google', view: 'Google'};

  // Valid search provider selections
  providers = [
    {value: 'google', view: 'Google'},
    {value: 'bing', view: 'Bing'},
    {value: 'duck', view: 'DuckDuckGo'}
  ]

  constructor(private settingsService: SettingsService,
              private snackbar: MatSnackBar) {
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {
    let searchSettings = changes.searchSettings.currentValue;
    if (searchSettings) {
      this.numResults.setValue(`${changes.searchSettings.currentValue.numResults}`);
      if (searchSettings.provider) {
        for (let provider of this.providers) {
          if (provider.value === searchSettings.provider) {
            this.provider = {value: provider.value, view: provider.view};
          }
        }
      }
    }
  }

  applyNumResultsChange() {
    let numResults: number = this.numResults.value as any;
    if (numResults >= this.MIN_RESULTS && numResults <= this.MAX_RESULTS) {
      this.searchSettings.numResults = numResults;
      this.updateSettings();
      this.numResultsChanged = true;
    } else {
      console.error(`Number of Results must be a number between ${this.MIN_RESULTS} and ${this.MAX_RESULTS}...`);
    }
  }

  onNumResultsChanged(_: Event) {
    let numResults: number = this.numResults as any;

    if (numResults > this.MAX_RESULTS || numResults < this.MIN_RESULTS) {
      let config: MatSnackBarConfig = {verticalPosition: 'bottom', duration: 2000};
      this.snackbar.open(`Must be a number between ${this.MIN_RESULTS} - ${this.MAX_RESULTS}`, 'Dismiss', config);
      this.numResults.setValue((numResults < this.MIN_RESULTS) ? `${this.MIN_RESULTS}` : `${this.MAX_RESULTS}`);
    }

    this.numResultsChanged = (`${numResults}` !== this.numResults.value);
  }

  private updateSettings() {
    this.settingsModified.emit({
      numResults: this.searchSettings.numResults,
      provider: this.provider.value
    });
    this.snackbar.open('Search Settings Saved!', 'Dismiss', {
      verticalPosition: "bottom", duration: 2000, panelClass: 'kc-success'
    })
  }


  onProviderChange(_: MatSelectChange) {
    this.updateSettings();
  }
}
