import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApplicationSettings} from '../../models/settings.model';
import {IpcService} from '../ipc/ipc.service';

@Injectable({
    providedIn: 'root'
})
export class SettingsService {
    constructor(private http: HttpClient, private ipcService: IpcService) {
    }

    getSettings(): Observable<ApplicationSettings> {
        return this.ipcService.getSettingsFile();
    }

    saveSettings(data: ApplicationSettings): Observable<ApplicationSettings> {
        return this.ipcService.saveSettingsFile(data);
    }
}
