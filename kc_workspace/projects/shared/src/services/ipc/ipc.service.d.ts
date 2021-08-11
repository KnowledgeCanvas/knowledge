import { Observable } from 'rxjs';
import { IpcRendererEvent } from 'electron';
import { ApplicationSettings } from '../../models/settings.model';
export declare class IpcService {
    private ipc;
    constructor();
    private getIpcRenderer;
    send(channel: string, ...args: any[]): void;
    on(channel: string, listener: (event: IpcRendererEvent, response: any) => any): void;
    getLocalFile(): Observable<string>;
    getSettingsFile(): Observable<ApplicationSettings>;
    saveSettingsFile(data: ApplicationSettings): Observable<ApplicationSettings>;
    checkPathExists(path: string): Observable<boolean>;
    getLocalPath(): Observable<string>;
    checkJava(): Observable<string>;
    checkDocker(): Observable<string>;
    createDirectory(path: string): Observable<string>;
    __createDirectory(path: string): Promise<string>;
    __checkDocker(): Promise<string>;
    __checkJava(): Promise<string>;
    __checkPathExists(path: string): Promise<boolean>;
    __getLocalFile(): Promise<string>;
    __getLocalPath(): Promise<string>;
    __getSettingsFile(): Promise<ApplicationSettings>;
    __saveSettingsFile(data: ApplicationSettings): Promise<ApplicationSettings>;
}
