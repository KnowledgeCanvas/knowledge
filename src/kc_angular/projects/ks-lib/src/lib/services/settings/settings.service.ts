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

    // this.settingsSubject.next(newSettings);

    return this.ipcService.saveSettingsFile(this.settingsSubject.value).subscribe((settings) => {
      this.settingsSubject.next(settings);
      if (settings.search)
        this.searchSettingsSubject.next(settings.search);
    });
  }
}
