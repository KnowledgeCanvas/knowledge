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
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {SettingsService} from "../../../services/ipc-services/settings-service/settings.service";
import {IngestSettingsModel} from "../../../models/settings.model";

@Component({
  selector: 'app-ingest-settings',
  templateUrl: './ingest-settings.component.html',
  styleUrls: ['./ingest-settings.component.scss']
})
export class IngestSettingsComponent implements OnInit {
  ingestSettings: IngestSettingsModel = {};

  constructor(private ref: DynamicDialogRef, private config: DynamicDialogConfig,
              private settingsService: SettingsService) {
    settingsService.ingest.subscribe(ingestSettings => {
      this.ingestSettings = ingestSettings
    });
  }

  ngOnInit(): void {
  }

  onAutoscanChange($event: any) {
    console.warn('Autoscan change has not been implemented...');
    if ($event.checked) {
    } else {
    }
  }

  onFileManagerChange($event: any) {
    console.warn('File Manager change has not been implemented...');
    if ($event.checked) {
    } else {
    }
  }
}
