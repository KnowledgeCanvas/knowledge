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

import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {SearchSettingsModel, SettingsModel} from 'projects/ks-lib/src/lib/models/settings.model';
import {ElectronIpcService} from "../electron-ipc/electron-ipc.service";

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private settingsSubject = new BehaviorSubject<SettingsModel>({});
  settings = this.settingsSubject.asObservable();
  private searchSettingsSubject = new BehaviorSubject<SearchSettingsModel>({})
  searchSettings = this.searchSettingsSubject.asObservable();

  constructor(private ipcService: ElectronIpcService) {
    this.ipcService.getSettingsFile().subscribe((settings) => {
      this.settingsSubject.next(settings);
      if (settings.search)
        this.searchSettingsSubject.next(settings.search);
    });
  }

  getSettings(): SettingsModel {
    return this.settingsSubject.value;
  }

  saveSettings(data: SettingsModel) {
    let newSettings = {...this.settingsSubject.value, ...data};
    return this.ipcService.saveSettingsFile(newSettings).subscribe((settings) => {
      this.settingsSubject.next(settings);
      if (settings.search)
        this.searchSettingsSubject.next(settings.search);
    });
  }
}
