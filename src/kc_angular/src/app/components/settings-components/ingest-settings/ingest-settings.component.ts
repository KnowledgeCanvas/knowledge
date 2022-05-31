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

import {Component, OnInit} from '@angular/core';
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {SettingsService} from "../../../services/ipc-services/settings-service/settings.service";
import {ElectronIpcService, PromptForDirectoryRequest} from "../../../services/ipc-services/electron-ipc/electron-ipc.service";
import {IngestSettingsModel} from "../../../../../../kc_shared/models/settings.model";

@Component({
  selector: 'app-ingest-settings',
  templateUrl: './ingest-settings.component.html',
  styleUrls: ['./ingest-settings.component.scss']
})
export class IngestSettingsComponent implements OnInit {
  ingestSettings: IngestSettingsModel = {};

  constructor(private ref: DynamicDialogRef, private config: DynamicDialogConfig,
              private settingsService: SettingsService, private ipcService: ElectronIpcService) {
    settingsService.ingest.subscribe(ingestSettings => {
      this.ingestSettings = ingestSettings;

      if (!ingestSettings.storageLocation) {
        const settings = this.settingsService.getSettings();
        this.ingestSettings.storageLocation = settings.appPath;
        settingsService.saveSettings({ingest: this.ingestSettings});
      }
    });
  }

  ngOnInit(): void {
  }

  onAutoscanChange($event: any) {
    if ($event.checked === undefined) {
      return;
    }
    this.ingestSettings.autoscan = $event.checked;
    this.settingsService.saveSettings({ingest: this.ingestSettings});
  }

  onFileManagerChange($event: any) {
    if ($event.checked === undefined) {
      return;
    }
    this.ingestSettings.managed = $event.checked;
    this.settingsService.saveSettings({ingest: this.ingestSettings});
  }

  show(autoscanLocation: string) {
    this.ipcService.showItemInFolder(autoscanLocation);
  }

  getStoragePath() {
    let req: PromptForDirectoryRequest = {
      title: 'Local Storage Location',
      defaultPath: this.ingestSettings.storageLocation,
      properties: ['openDirectory', 'showHiddenFiles', 'createDirectory']
    }
    this.ipcService.promptForDirectory(req).then((path) => {
      this.ingestSettings.storageLocation = path;
      this.settingsService.saveSettings({ingest: this.ingestSettings});
    }).catch((reason) => {
      console.error(reason);
    });
  }

  getAutoscanPath() {
    let req: PromptForDirectoryRequest = {
      title: 'Autoscan Location',
      defaultPath: this.ingestSettings.autoscanLocation,
      properties: ['openDirectory']
    }
    this.ipcService.promptForDirectory(req).then((path) => {
      this.ingestSettings.autoscanLocation = path;
      this.settingsService.saveSettings({ingest: this.ingestSettings});
    }).catch((reason) => {
      console.error(reason);
    });
  }
}
