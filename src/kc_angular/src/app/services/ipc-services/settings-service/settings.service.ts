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

import {Injectable, NgZone} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {ElectronIpcService} from "../electron-ipc/electron-ipc.service";
import {ApplicationSettingsModel, DisplaySettingsModel, IngestSettingsModel, SearchSettingsModel, SettingsModel} from "../../../../../../kc_shared/models/settings.model";

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private _settings = new BehaviorSubject<SettingsModel>({} as any);
  all = this._settings.asObservable();

  private _search = new BehaviorSubject<SearchSettingsModel>({} as any)
  search = this._search.asObservable();

  private _app = new BehaviorSubject<ApplicationSettingsModel>({} as any);
  app = this._app.asObservable();

  private _ingest = new BehaviorSubject<IngestSettingsModel>({} as any);
  ingest = this._ingest.asObservable();

  private _display = new BehaviorSubject<DisplaySettingsModel>({} as any);
  display = this._display.asObservable();
  private send = window.api.send;
  private receive = window.api.receive;
  private receiveOnce = window.api.receiveOnce;
  private settingsChannels = {
    getSettings: 'A2E:Settings:Get',
    getDefaults: 'A2E:Settings:Defaults',
    receiveAll: 'E2A:Settings:All',
    receiveDefaults: 'E2A:Settings:Defaults',
    setSettings: 'A2E:Settings:Set'
  }

  constructor(private ipcService: ElectronIpcService, private zone: NgZone) {
    /**
     * Keep a copy of default settings to allow other components and services to instantiate
     */
    this.receiveOnce(this.settingsChannels.receiveDefaults, (settings: SettingsModel) => {
      this.zone.run(() => {
        this._defaults = settings;
      })
    });

    this.send(this.settingsChannels.getDefaults);

    /**
     * Settings are stored in a JSON file via Electron and kept consistent through IPC messages
     */
    this.receive(this.settingsChannels.receiveAll, (settings: SettingsModel) => {
      this.zone.run(() => {
        console.debug(`[Debug]-[${new Date().toLocaleString()}]-[SettingsService]: Settings Updated: `, settings);
        this._settings.next(settings);

        if (settings.search) {
          this._search.next(settings.search);
        } else {
          console.error('SettingsService - Search Settings not found...');
        }

        if (settings.app) {
          this._app.next(settings.app);
        } else {
          console.error('SettingsService - Application Settings not found...');
        }

        if (settings.ingest) {
          this._ingest.next(settings.ingest);
        } else {
          console.error('SettingsService - Ingest Settings not found...');
        }

        if (settings.display) {
          this._display.next(settings.display);
        } else {
          console.error('SettingsService - Display Settings not found...');
        }
      })
    })

    this.send(this.settingsChannels.getSettings);
  }

  private _defaults!: SettingsModel;

  get defaults() {
    return this._defaults;
  }

  get(): SettingsModel {
    return this._settings.value;
  }

  /**
   * If `settings` is an Object, make sure it conforms to the root level SettingsModel
   * i.e. if updating ingest, the parameter should contain {ingest: {...}}
   * @param settings
   */
  set(settings: SettingsModel | Object) {
    this.send(this.settingsChannels.setSettings, settings);
  }


}
