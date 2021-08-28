import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable} from 'rxjs';
import {SettingsModel} from '../../models/settings.model';
import {IpcService} from "../ipc/ipc.service";

export interface SearchSettingsModel {
  numResults?: number
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private settingsSubject = new BehaviorSubject<SettingsModel>({});
  private searchSettingsSubject = new BehaviorSubject<SearchSettingsModel>({})
  settings = this.settingsSubject.asObservable();
  searchSettings = this.searchSettingsSubject.asObservable();

  constructor(private http: HttpClient,
              private ipcService: IpcService) {
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
