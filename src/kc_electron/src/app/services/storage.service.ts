/*
 * Copyright (c) 2023 Rob Royce
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */


import {BrowserWindow} from "electron";
import {take, tap} from "rxjs";
import {SettingsModel} from "../../../../kc_shared/models/settings.model";
import {IpcMessage} from "../../../../kc_shared/models/electron.ipc.model";

const settingsService = require('./settings.service');
const share: any = (global as any).share;
const {ipcMain} = require('electron');
const fs = require('fs');
const path = require('path');

const storage = require('electron-json-storage');


class StorageService {
    private appPath: string = "";
    private storagePath: string = "";

    private projectsPath = "";
    private sourcesPath = "";

    constructor() {
        // On startup, get paths and read in data. Another method will be defined for "on demand" storage requests
        settingsService.all.pipe(
            take(1),
            tap((settings: SettingsModel) => {
                // Get/set important paths
                this.appPath = path.resolve(settings.system.appPath);
                this.storagePath = path.resolve(settings.system.appPath, 'storage');
                this.projectsPath = path.resolve(this.storagePath, 'projects');

                console.log('Default data storage path was: ', storage.getDefaultDataPath());
                storage.setDataPath(this.storagePath);
                console.log('New data storage path: ', storage.getDataPath());
            })
        ).subscribe();

        ipcMain.on('A2E:Storage:Delete', (_: any, config: { key: string | string[], subpath?: string[] }) => {
            this.deleteStorage(config).then((msg) => {
                let kcMainWindow = BrowserWindow.getAllWindows()[0];
                kcMainWindow.webContents.send('E2A:Storage:Delete', msg);
            })
        });

        ipcMain.on('A2E:Storage:Get', (_: any, config: { key: string, subpath?: string[] }) => {
            this.getStorage(config).then((msg) => {
                let kcMainWindow = BrowserWindow.getAllWindows()[0];
                kcMainWindow.webContents.send('E2A:Storage:Get', msg);
            })
        });

        ipcMain.on('A2E:Storage:GetMany', (_: any, config: { key: string[], subpath?: string[] }) => {
            this.getStorage(config).then((msg) => {
                let kcMainWindow = BrowserWindow.getAllWindows()[0];
                kcMainWindow.webContents.send('E2A:Storage:GetMany', msg);
            })
        });

        ipcMain.on('A2E:Storage:Set', (_: any, config: { key: string, data: any, subpath?: string[] }) => {
            this.setStorage(config).then((msg) => {
                let kcMainWindow = BrowserWindow.getAllWindows()[0];
                kcMainWindow.webContents.send('E2A:Storage:Set', msg);
            })
        });
    }

    private resolveSubpath(subpath?: string) {
        // Subpath is optional. If exists, use it as storage path, otherwise use default
        if (subpath) {
            const dataPath = path.resolve(this.storagePath, subpath);
            storage.setDataPath(dataPath);
        } else {
            storage.setDataPath(this.storagePath);
        }
    }

    deleteStorage(config: { key: string | string[], subpath?: string[] }) {
        return new Promise<IpcMessage>((resolve, reject) => {
            const key = config.key;
            const subpath = config.subpath?.join(path.sep) ?? undefined;

            // Prepare IPC message
            let msg: IpcMessage = new IpcMessage();

            // Key is a required field, send error message if it does not exist
            if (!key) {
                msg.error = {
                    code: 403,
                    message: 'Storage request must contain a valid key',
                    label: `Invalid Storage Request (${key})`
                }
                reject(msg);
            }

            // Subpath is optional. If exists, use it as storage path, otherwise use default
            this.resolveSubpath(subpath);

            // Get data from file and send back via IPC
            if (typeof key === 'string') {
                storage.remove(key);

            } else {
                for (let k in key) {
                    storage.remove(k);
                }
            }

            msg.success = {
                data: true
            };
            resolve(msg);
        })
    }

    getStorage(config: { key: string | string[], subpath?: string[] }) {
        return new Promise<IpcMessage>((resolve, reject) => {
            const key = config.key;
            const subpath = config.subpath?.join(path.sep) ?? undefined;

            // Prepare IPC message
            let msg: IpcMessage = new IpcMessage();

            // Key is a required field, send error message if it does not exist
            if (!key) {
                msg.error = {
                    code: 403,
                    message: 'Storage request must contain a valid key',
                    label: `Invalid Storage Request (${key})`
                }
                reject(msg);
            }

            // Subpath is optional. If exists, use it as storage path, otherwise use default
            this.resolveSubpath(subpath);

            let callback = (error: any, data: any) => {
                if (error) {
                    console.error('Error getting projects: ', error);
                    msg.error = {
                        code: 403,
                        message: error,
                        label: `Failed to retrieve (${key})`
                    };
                    reject(msg);
                } else {
                    // console.log(`Got : ${key}`, data); // TODO
                    msg.success = {
                        data: data
                    };
                    resolve(msg);
                }
            }

            // Get data from file and send back via IPC
            if (typeof key === 'string') {
                storage.get(key, callback)
            } else {
                storage.getMany(key, callback)
            }

        })
    }

    setStorage(config: { key: string | string[], data: any, subpath?: string[] }): Promise<IpcMessage> {
        return new Promise<IpcMessage>((resolve, reject) => {
            const key = config.key;
            const data = config.data;
            const subpath = config.subpath?.join(path.sep) ?? undefined;

            // Prepare IPC message
            let msg: IpcMessage = {
                error: undefined,
                success: undefined
            }

            // Key is a required field, send error message if it does not exist
            if (!key) {
                msg.error = {
                    code: 403,
                    message: 'Storage request must contain a valid key',
                    label: `Invalid Storage Request (${key})`
                }
                reject(msg);
            }

            if (!data) {
                msg.error = {
                    code: 403,
                    message: 'Storage request must contain valid data.',
                    label: `Invalid Storage Request (${key})`
                }
                reject(msg);
            }

            // Subpath is optional. If exists, use it as storage path, otherwise use default
            if (subpath) {
                const dataPath = path.resolve(this.storagePath, subpath);
                storage.setDataPath(dataPath);
            } else {
                storage.setDataPath(this.storagePath);
            }
            // console.log('Setting data path to: ', storage.getDataPath()); // TODO

            storage.set(key, data, (error: any) => {
                if (error) {
                    console.error('Unable to set : ', error);
                    msg.error = {
                        code: 403,
                        message: error,
                        label: `Unable to set ${key}`
                    }
                    reject(msg);
                } else {
                    msg.success = {
                        message: `Storage Request Fulfilled (${key})`
                    }
                    resolve(msg);
                }
            })
        })
    }
}

const storageService = new StorageService();
module.exports = storageService;
