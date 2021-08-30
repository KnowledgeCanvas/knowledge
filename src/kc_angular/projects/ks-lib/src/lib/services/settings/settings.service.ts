import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject} from 'rxjs';
import {SettingsModel} from '../../../../../shared/src/models/settings.model';
import {ElectronIpcService} from "../electron-ipc/electron-ipc.service";

export interface SearchSettingsModel {
  numResults?: number
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private settingsSubject = new BehaviorSubject<SettingsModel>({});
  settings = this.settingsSubject.asObservable();
  private searchSettingsSubject = new BehaviorSubject<SearchSettingsModel>({})
  searchSettings = this.searchSettingsSubject.asObservable();

  constructor(private http: HttpClient,
              private ipcService: ElectronIpcService) {
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
    let newSettings = {...this.settingsSubject.value, ...data}
    this.settingsSubject.next(newSettings);
    return this.ipcService.saveSettingsFile(this.settingsSubject.value).subscribe((settings) => {
      this.settingsSubject.next(settings);
      if (settings.search)
        this.searchSettingsSubject.next(settings.search);
    });
  }
}
