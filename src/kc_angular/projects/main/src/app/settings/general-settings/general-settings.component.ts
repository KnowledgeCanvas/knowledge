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

import {Component, OnInit} from '@angular/core';
import {SettingsService} from "../../../../../ks-lib/src/lib/services/settings/settings.service";
import {DisplaySettingsModel, IngestSettingsModel, SearchSettingsModel, SettingsModel, StorageSettingsModel} from "projects/ks-lib/src/lib/models/settings.model";

@Component({
  selector: 'app-general-settings',
  templateUrl: './general-settings.component.html',
  styleUrls: ['./general-settings.component.scss']
})
export class GeneralSettingsComponent implements OnInit {
  ingest: IngestSettingsModel | undefined = undefined;
  search: SearchSettingsModel | undefined = undefined;
  display: DisplaySettingsModel | undefined = undefined;
  storage: StorageSettingsModel | undefined = {};
  private settings: SettingsModel = {};

  constructor(private settingsService: SettingsService) {
    settingsService.settings.subscribe(settings => {
      this.settings = settings;

      if (settings.ingest) {
        this.ingest = settings.ingest;
      }

      if (settings.search) {
        this.search = settings.search;
      }

      if (settings.display) {
        this.display = settings.display;
      }
    });
  }

  ngOnInit(): void {
  }

  ingestSettingsModified(ingestSettings: IngestSettingsModel) {
    this.settingsService.saveSettings({ingest: ingestSettings});
  }

  searchSettingsModified(searchSettings: SearchSettingsModel) {
    this.settingsService.saveSettings({search: searchSettings});
  }

  displaySettingsModified(displaySettings: DisplaySettingsModel) {
    this.settingsService.saveSettings({display: displaySettings});
  }
}
