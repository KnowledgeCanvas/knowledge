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

import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {ElectronIpcService} from "../electron-ipc/electron-ipc.service";
import {ApplicationSettingsModel, IngestSettingsModel, SearchSettingsModel, SettingsModel} from "../../../../../../kc_shared/models/settings.model";

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private _settings = new BehaviorSubject<SettingsModel>({});
  all = this._settings.asObservable();

  private _search = new BehaviorSubject<SearchSettingsModel>({})
  search = this._search.asObservable();

  private _app = new BehaviorSubject<ApplicationSettingsModel>({});
  app = this._app.asObservable();

  private _ingest = new BehaviorSubject<IngestSettingsModel>({});
  ingest = this._ingest.asObservable();

  constructor(private ipcService: ElectronIpcService) {
    this.ipcService.getSettingsFile().subscribe((settings) => {
      this.updateSettings(settings);
    });
  }

  getSettings(): SettingsModel {
    return this._settings.value;
  }

  updateSettings(settings: SettingsModel) {
    this._settings.next(settings);

    if (settings.search) {
      this._search.next(settings.search);
    }

    if (settings.app) {
      this._app.next(settings.app);
    }

    if (settings.ingest) {
      this._ingest.next(settings.ingest);
    }
  }

  saveSettings(data: SettingsModel) {
    let newSettings = {...this._settings.value, ...data};
    return this.ipcService.saveSettingsFile(newSettings).subscribe((settings) => {
      this.updateSettings(settings);
    });
  }
}
