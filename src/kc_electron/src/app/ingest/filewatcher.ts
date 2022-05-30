/**
 Copyright 2022 Rob Royce

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

import {IngestSettingsModel} from "../models/ingest.model";
import {Subscription} from 'rxjs';
import {FSWatcher} from "chokidar";
import {IpcMessage} from "../models/electron.ipc.model";

const chokidar = require('chokidar');
const mime = require('mime-types');
const share: any = (global as any).share;
const fs = share.fs;
const path = share.path;
const ipcMain = share.ipcMain;
const uuid = share.uuid;

const settingsService = require('../controller/settings.service');
let appEnv = settingsService.getSettings();

// TODO: give file watcher its own thread so it doesn't affect the main process

interface FilewatcherUpdate {
    remove: string[]
}

class IngestFileWatcher {
    ingestSettings: IngestSettingsModel | null = null;
    ingestWatcher: FSWatcher | null = null;
    ingestSubscription: Subscription;
    ipcSubscription: any;
    interval: any = undefined;
    queue: string[] = [];

    constructor() {
        // Listen for updates from the app (i.e. when KS have been successfully imported)
        this.ipcSubscription = ipcMain.on('A2E:FileWatcher:Finalize', (event: any, request: FilewatcherUpdate) => {
            console.log('File Watcher was notified with event: ', event)
            console.log('File watcher request: ', request);
            for (let filePath of request.remove) {
                this.queue.filter((f) => f !== filePath);
            }
        })


        this.ingestSubscription = settingsService.ingest.subscribe((ingest: IngestSettingsModel) => {
            if (!this.ingestSettings) {
                this.ingestSettings = ingest;
            } else {
                const prev = JSON.stringify(this.ingestSettings);
                const next = JSON.stringify(ingest);

                if (prev === next) {
                    return;
                } else if (this.ingestSettings.autoscan !== ingest.autoscan) {
                    this.ingestSettings = ingest;
                }
            }


            console.log('Ingest settings have changed: ', ingest);

            if (ingest.autoscan) {
                this.start(ingest);
            } else {
                this.stop();
            }
        });
    }

    reset() {
        clearInterval(this.interval);
        this.ingestWatcher = null;
        this.queue = [];
    }

    stop() {
        console.log('Shutting down watcher...');

        if (this.ingestWatcher) {
            this.ingestWatcher.close().catch((reason) => {
                console.warn('Ingest file watcher failed to close... ', reason);
            });
        }
        this.reset();
    }

    start(settings: IngestSettingsModel) {
        const watchPath = path.resolve(settings.autoscanLocation);

        if (!watchPath) {
            console.error('Unable to find file watcher path...');
        }

        let fileStat: any;
        try {
            fileStat = fs.statSync(watchPath);
        } catch (e) {
            console.warn('Could not find directory: ', watchPath, '... creating now...');
            fs.mkdirSync(watchPath, {recursive: true});
            fileStat = fs.statSync(watchPath);
        }

        console.log(`Starting watcher in ${watchPath}...`);
        console.log(`File watcher stat: `, fileStat);
        this.setWatcher(watchPath);

        this.interval = setInterval(() => {
            if (this.queue.length <= 0) {
                return;
            }

            let kcMainWindow: any = share.BrowserWindow.getAllWindows()[0];
            let requests: IpcMessage[] = [];
            for (let filePath of this.queue) {
                let fstat: any;
                try {
                    fstat = fs.statSync(filePath);
                } catch (e) {
                    console.warn('FileWatcher found a file that does not exist...');
                    continue;
                }

                const contentType = mime.lookup(filePath);
                let fileExtension = mime.extension(contentType);
                if (!fileExtension) {
                    console.warn('Could not find file extension for filePath: ', filePath);
                    fileExtension = path.extname(filePath).split('.')[1];
                    console.warn('Using path extname instead: ', fileExtension);
                }
                let newId = uuid.v4();


                let newFilePath = path.resolve(appEnv.appPath, 'files', newId) + `.${fileExtension}`;
                fs.copyFileSync(filePath, newFilePath);

                const fileModel = {
                    filename: path.basename(filePath),
                    id: {value: newId},
                    path: newFilePath,
                    size: fstat.size,
                    type: contentType
                }


                const req: IpcMessage = {
                    error: undefined,
                    success: {
                        data: fileModel
                    }
                }
                requests.push(req);
            }

            kcMainWindow.webContents.send('E2A:FileWatcher:NewFiles', requests);
            this.queue = [];
        }, this.ingestSettings?.interval);
    }

    setWatcher(watchPath: string) {
        this.ingestWatcher = chokidar.watch(watchPath, {
            // intended behavior: ignore dotfiles
            ignored: /(^|[\/\\])\../,

            // intended behavior: keep the file watcher running as long as the user has 'Autoscan' enabled
            persistent: true,

            // intended behavior: if the user doesn't move the files, then we shouldn't touch them and show them next time
            ignoreInitial: false
        })
            .on('add', (filePath: string) => {
                const found = this.queue.find((f) => f === filePath);
                if (!found) {
                    this.queue.push(filePath);
                    console.log('File list: ', this.queue);
                }
            });
    }
}

const fileWatcher = new IngestFileWatcher();


module.exports = {
    fileWatcher
}
