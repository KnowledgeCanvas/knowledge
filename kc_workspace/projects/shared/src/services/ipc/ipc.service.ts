import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {SettingsModel} from "../../models/settings.model";

const DEFAULT_ERROR = 'Unknown or undefined error occurred.';

@Injectable({
  providedIn: 'root'
})
export class IpcService {
  constructor() {
  }

  // =============================================== //
  // TODO Move all the methods below into the respective classes
  //  that call them, and instead use the generic methods above
  // =============================================== //

  // getLocalFile(): Observable<string> {
  //     return new Observable<string>(subscriber => {
  //         this.__getLocalFile()
  //             .then(result => {
  //                 subscriber.next(result);
  //                 subscriber.complete();
  //             })
  //             .catch(reason => {
  //                 console.error('Could not get file: ', reason);
  //             });
  //     });
  // }

  getSettingsFile(): Observable<SettingsModel> {
    return new Observable<SettingsModel>(subscriber => {
      window.api.receive("app-get-settings-results", (data: any) => {
        subscriber.next(data);
      });
      window.api.send("app-get-settings", {});
    });
  }

  saveSettingsFile(settings: SettingsModel): Observable<SettingsModel> {
      return new Observable<SettingsModel>(subscriber => {
        window.api.receive("app-save-settings-results", (data: any) => {
          subscriber.next(data);
        });
        window.api.send("app-save-settings", settings);
      });
  }
  //
  //
  // checkPathExists(path: string): Observable<boolean> {
  //     return new Observable<boolean>(subscriber => {
  //         this.__checkPathExists(path)
  //             .then(result => {
  //                 subscriber.next(result);
  //                 subscriber.complete();
  //             })
  //             .catch(reason => {
  //                 subscriber.error(reason);
  //             });
  //     });
  // }

  // checkJava(): Observable<string> {
  //     return new Observable<string>(subscriber => {
  //         this.__checkJava()
  //             .then(version => {
  //                 subscriber.next(version);
  //                 subscriber.complete();
  //             })
  //             .catch(reason => {
  //                 subscriber.error(reason);
  //             });
  //     });
  // }
  //
  // checkDocker(): Observable<string> {
  //     return new Observable<string>(subscriber => {
  //         this.__checkDocker()
  //             .then(version => {
  //                 subscriber.next(version);
  //                 subscriber.complete();
  //             })
  //             .catch(reason => {
  //                 subscriber.error(reason);
  //             });
  //     });
  // }
  //
  // createDirectory(path: string): Observable<string> {
  //     return new Observable<string>(subscriber => {
  //         this.__createDirectory(path)
  //             .then(result => {
  //                 subscriber.next(result);
  //                 subscriber.complete();
  //             })
  //             .catch(reason => {
  //                 subscriber.error(reason);
  //             });
  //     });
  // }

  // __createDirectory(path: string): Promise<string> {
  //     return new Promise<string>((resolve, reject) => {
  //         this.ipc?.send('create-path', path);
  //         this.ipc?.on('create-path-reply', (event, response) => {
  //             if (response.error) {
  //                 reject(response.error);
  //             } else if (response.path) {
  //                 resolve(response.path);
  //             } else {
  //                 reject(DEFAULT_ERROR);
  //             }
  //         });
  //     });
  // }
  //
  // __checkDocker(): Promise<string> {
  //     return new Promise<string>((resolve, reject) => {
  //         this.ipc?.send('docker-version');
  //         this.ipc?.on('docker-version-reply', (event, response) => {
  //             if (response.error) {
  //                 setTimeout(() => {
  //                     reject(response.error);
  //                 }, 1500);
  //             } else if (response.version) {
  //                 resolve(response.version);
  //             } else {
  //                 setTimeout(() => {
  //                     reject(DEFAULT_ERROR);
  //                 }, 1500);
  //             }
  //         });
  //     });
  // }
  //
  // __checkJava(): Promise<string> {
  //     return new Promise<string>((resolve, reject) => {
  //         this.ipc?.send('check-java-version');
  //         this.ipc?.on('check-java-version-reply', (event, response) => {
  //             if (response?.error) {
  //                 setTimeout(() => {
  //                     reject(response.error);
  //                 }, 1500);
  //             } else if (response.version) {
  //                 resolve(response.version);
  //             } else {
  //                 setTimeout(() => {
  //                     reject(DEFAULT_ERROR);
  //                 }, 1500);
  //             }
  //         });
  //     });
  // }
  //
  // __checkPathExists(path: string): Promise<boolean> {
  //     return new Promise<boolean>((resolve, reject) => {
  //         this.ipc?.send('check-path-exists', path);
  //         this.ipc?.on('check-path-exists-reply', (event, response) => {
  //             console.log('Response from check-path-exists-reply: ', response);
  //             if (response?.error) {
  //                 setTimeout(() => {
  //                     reject(response.error);
  //                 }, 1500);
  //             } else if (response?.exists) {
  //                 resolve(response.exists);
  //             } else {
  //                 setTimeout(() => {
  //                     reject(DEFAULT_ERROR);
  //                 }, 1500);
  //             }
  //         });
  //     });
  // }
  //
  // __getLocalFile(): Promise<string> {
  //     return new Promise<string>((resolve, reject) => {
  //         this.ipc?.send('open-file-dialog', {
  //             message: 'Select FiddlerRootCertificate.crt',
  //             filters: [{
  //                 name: 'Fiddler Root Certificate',
  //                 extensions: ['crt', 'cert']
  //             }]
  //         });
  //         this.ipc?.on('open-file-dialog-reply', (event, response) => {
  //             if (response?.error) {
  //                 reject(response.error);
  //             } else {
  //                 resolve(response.path);
  //             }
  //         });
  //     });
  // }
  //
  // __getSettingsFile(): Promise<ApplicationSettingsModel> {
  //     return new Promise<ApplicationSettingsModel>((resolve, reject) => {
  //         this.ipc?.send('get-settings');
  //         this.ipc?.on('get-settings-reply', (event, response) => {
  //             if (response.error) {
  //                 reject(response.error);
  //             } else {
  //                 const tmp: ApplicationSettingsModel = {
  //                     ...environment,
  //                     ...response.settings
  //                 };
  //                 resolve(tmp);
  //             }
  //         });
  //     });
  // }
  //
  // __saveSettingsFile(data: ApplicationSettingsModel): Promise<ApplicationSettingsModel> {
  //     return new Promise<ApplicationSettingsModel>((resolve, reject) => {
  //         this.ipc?.send('save-settings', data);
  //         this.ipc?.on('save-settings-reply', (event, response) => {
  //             if (response.error) {
  //                 reject(response.error);
  //             } else {
  //                 resolve(response.settings);
  //             }
  //         });
  //     });
  // }
}

