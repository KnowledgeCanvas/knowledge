import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApplicationSettings } from 'projects/ks-lib/src/lib/models/settings.model';
import { IpcService } from '../ipc/ipc.service';
export declare class SettingsService {
    private http;
    private ipcService;
    constructor(http: HttpClient, ipcService: IpcService);
    getSettings(): Observable<ApplicationSettings>;
    saveSettings(data: ApplicationSettings): Observable<ApplicationSettings>;
}
