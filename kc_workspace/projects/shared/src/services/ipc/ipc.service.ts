import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {IpcRenderer, IpcRendererEvent} from 'electron';
import {ApplicationSettings} from "../../models/settings.model";
import {environment} from '../../../../setup/src/environments/environment';

const DEFAULT_ERROR = 'Unknown or undefined error occurred.';

@Injectable({
    providedIn: 'root'
})
export class IpcService {
    private ipc: IpcRenderer | undefined;

    constructor() {
        // This is basically a work-around for getting electron to play nicely with Angular.
        // This is only possible by telling TypeScript that it should expect a type called NodeRequire
        // in the tsconfig.json file.
        this.getIpcRenderer();
    }

    private getIpcRenderer(): void {
        try {
            this.ipc = window.require('electron').ipcRenderer;
        } catch (e) {
            console.error('Could not find Electron IpcRenderer. Something went catastrophically wrong.');
            process.exit(-1);
        }
    }

    send(channel: string, ...args: any[]): void {
        if (!this.ipc) {
            return;
        }
        this.ipc.send(channel, ...args);
    }

    on(channel: string, listener: (event: IpcRendererEvent, response: any) => any): void {
        if (!this.ipc) {
            return;
        }
        this.ipc.on(channel, listener);
    }

    // =============================================== //
    // TODO Move all the methods below into the respective classes
    //  that call them, and instead use the generic methods above
    // =============================================== //

    getLocalFile(): Observable<string> {
        return new Observable<string>(subscriber => {
            this.__getLocalFile()
                .then(result => {
                    subscriber.next(result);
                    subscriber.complete();
                })
                .catch(reason => {
                    console.error('Could not get file: ', reason);
                });
        });
    }

    getSettingsFile(): Observable<ApplicationSettings> {
        return new Observable<ApplicationSettings>(subscriber => {
            this.__getSettingsFile()
                .then(result => {
                    subscriber.next(result);
                    subscriber.complete();
                })
                .catch(reason => {
                    console.error('Could not get settings file: ', reason);
                });
        });
    }

    saveSettingsFile(data: ApplicationSettings): Observable<ApplicationSettings> {
        return new Observable<ApplicationSettings>(subscriber => {
            this.__saveSettingsFile(data)
                .then(result => {
                    subscriber.next(result);
                    subscriber.complete();
                })
                .catch(reason => {
                    console.error('Error occurred during IPC: ', reason);
                });
        });
    }


    checkPathExists(path: string): Observable<boolean> {
        return new Observable<boolean>(subscriber => {
            this.__checkPathExists(path)
                .then(result => {
                    subscriber.next(result);
                    subscriber.complete();
                })
                .catch(reason => {
                    subscriber.error(reason);
                });
        });
    }

    checkJava(): Observable<string> {
        return new Observable<string>(subscriber => {
            this.__checkJava()
                .then(version => {
                    subscriber.next(version);
                    subscriber.complete();
                })
                .catch(reason => {
                    subscriber.error(reason);
                });
        });
    }

    checkDocker(): Observable<string> {
        return new Observable<string>(subscriber => {
            this.__checkDocker()
                .then(version => {
                    subscriber.next(version);
                    subscriber.complete();
                })
                .catch(reason => {
                    subscriber.error(reason);
                });
        });
    }

    createDirectory(path: string): Observable<string> {
        return new Observable<string>(subscriber => {
            this.__createDirectory(path)
                .then(result => {
                    subscriber.next(result);
                    subscriber.complete();
                })
                .catch(reason => {
                    subscriber.error(reason);
                });
        });
    }

    __createDirectory(path: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            this.ipc?.send('create-path', path);
            this.ipc?.on('create-path-reply', (event, response) => {
                if (response.error) {
                    reject(response.error);
                } else if (response.path) {
                    resolve(response.path);
                } else {
                    reject(DEFAULT_ERROR);
                }
            });
        });
    }

    __checkDocker(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            this.ipc?.send('docker-version');
            this.ipc?.on('docker-version-reply', (event, response) => {
                if (response.error) {
                    setTimeout(() => {
                        reject(response.error);
                    }, 1500);
                } else if (response.version) {
                    resolve(response.version);
                } else {
                    setTimeout(() => {
                        reject(DEFAULT_ERROR);
                    }, 1500);
                }
            });
        });
    }

    __checkJava(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            this.ipc?.send('check-java-version');
            this.ipc?.on('check-java-version-reply', (event, response) => {
                if (response?.error) {
                    setTimeout(() => {
                        reject(response.error);
                    }, 1500);
                } else if (response.version) {
                    resolve(response.version);
                } else {
                    setTimeout(() => {
                        reject(DEFAULT_ERROR);
                    }, 1500);
                }
            });
        });
    }

    __checkPathExists(path: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this.ipc?.send('check-path-exists', path);
            this.ipc?.on('check-path-exists-reply', (event, response) => {
                console.log('Response from check-path-exists-reply: ', response);
                if (response?.error) {
                    setTimeout(() => {
                        reject(response.error);
                    }, 1500);
                } else if (response?.exists) {
                    resolve(response.exists);
                } else {
                    setTimeout(() => {
                        reject(DEFAULT_ERROR);
                    }, 1500);
                }
            });
        });
    }

    __getLocalFile(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            this.ipc?.send('open-file-dialog', {
                message: 'Select FiddlerRootCertificate.crt',
                filters: [{
                    name: 'Fiddler Root Certificate',
                    extensions: ['crt', 'cert']
                }]
            });
            this.ipc?.on('open-file-dialog-reply', (event, response) => {
                if (response?.error) {
                    reject(response.error);
                } else {
                    resolve(response.path);
                }
            });
        });
    }

    __getSettingsFile(): Promise<ApplicationSettings> {
        return new Promise<ApplicationSettings>((resolve, reject) => {
            this.ipc?.send('get-settings');
            this.ipc?.on('get-settings-reply', (event, response) => {
                if (response.error) {
                    reject(response.error);
                } else {
                    const tmp: ApplicationSettings = {
                        ...environment,
                        ...response.settings
                    };
                    resolve(tmp);
                }
            });
        });
    }

    __saveSettingsFile(data: ApplicationSettings): Promise<ApplicationSettings> {
        return new Promise<ApplicationSettings>((resolve, reject) => {
            this.ipc?.send('save-settings', data);
            this.ipc?.on('save-settings-reply', (event, response) => {
                if (response.error) {
                    reject(response.error);
                } else {
                    resolve(response.settings);
                }
            });
        });
    }
}

