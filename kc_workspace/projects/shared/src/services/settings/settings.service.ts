import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {SettingsModel} from '../../models/settings.model';
import {IpcService} from "../ipc/ipc.service";

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private settings: SettingsModel = {};

  constructor(private http: HttpClient, private ipcService: IpcService) {
    this.ipcService.getSettingsFile().subscribe((settings) => {
      this.settings = settings;
      console.log('Retrieved settings: ', this.settings);
    })
  }

  getSettings(): Observable<SettingsModel> {
    return this.ipcService.getSettingsFile();
  }

  saveSettings(data: SettingsModel): Observable<SettingsModel> {
    console.log('Saving settings: ', data);
    this.settings = {...this.settings, ...data};
    return this.ipcService.saveSettingsFile(this.settings);
  }
}
