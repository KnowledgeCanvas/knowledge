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

import {FSWatcher} from "chokidar";
import {IpcMessage} from "../models/electron.ipc.model";
import {IngestSettingsModel} from "../../../../kc_shared/models/settings.model";
import {FileWatcherUpdate, PendingFileTransfer} from "../../../../kc_shared/models/file.source.model";

export const PENDING_PREFIX = 'pending-'

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

class IngestFileWatcher {
    firstRun: boolean = true;
    ingestSettings: IngestSettingsModel | null = null;
    ingestWatcher: FSWatcher | null = null;
    interval: any = undefined;
    queue: string[] = [];
    pending: PendingFileTransfer[] = [];

    constructor() {
        // Listen for updates from the app (i.e. when KS have been successfully imported)
        ipcMain.on('A2E:FileWatcher:Finalize', (event: any, update: FileWatcherUpdate) => {
            console.log('File watcher request: ', update);
            this.finalize(update.id, update.method);
        })

        ipcMain.on('A2E:FileWatcher:Delete', (_: any, path: string) => {
            console.warn('IngestFileWatcher deleting managed file at: ', path);
            IngestFileWatcher.delete(path);
        })


        settingsService.ingest.subscribe((ingest: IngestSettingsModel) => {
            // TODO: handle the following events
            // Case: local ingest settings do not exist
            // Case: new settings are the same as the previous settings
            // Case: autoscan toggled on
            // Case: autoscan toggled off
            // Case: storage path changed
            // Case: Autoscan interval has changed
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


            if (this.firstRun) {
                this.clean();
                this.firstRun = false;
            }

            console.log('Ingest settings have changed: ', ingest);

            if (ingest.autoscan) {
                this.start(ingest);
            } else {
                this.stop();
            }
        });
    }

    private clean() {
        // TODO: Check the files directory on application startup.
        // If there are any files with the PENDING_PREFIX, move them back to the autoscan directory. Runs only once at startup
        let files;
        try {
            const storagePath = path.resolve(this.ingestSettings?.storageLocation, 'files');
            files = fs.readdirSync(storagePath);
        } catch (e) {
            console.error(`IngestFileWatcher no files found at ${this.ingestSettings?.storageLocation}`);
        }

        let move: {from: string, to: string}[] = [];

        for (let file of files) {
            if (typeof file === 'string' && file.includes(PENDING_PREFIX)) {
                console.log('Found pending file in autoscan storage location...');
                const filename = path.basename(file).replace(PENDING_PREFIX, '');
                if (this.ingestSettings?.autoscanLocation) {
                    const oldPath = path.resolve(this.ingestSettings.storageLocation, 'files', file);
                    const newPath = path.resolve(this.ingestSettings.autoscanLocation, filename);
                    move.push({from: oldPath, to: newPath});
                }
            }
        }

        if (move.length > 0) {
            setTimeout(() => {
                for (let mv of move) {
                    IngestFileWatcher.move(mv.from, mv.to);
                }
                IngestFileWatcher.warn('Autoscan Files Recovered', `${move.length} ${move.length > 1 ? 'files were' : 'file was'} recovered and moved back to the autoscan directory.`);
            }, 5000);

        }
    }

    private static delete(path: string) {
        console.warn('IngestFileWatcher removing file at ', path);
        try {
            fs.rmSync(path);
        } catch (e) {
            IngestFileWatcher.error('Exception', `Failed to delete file at ${path}`)
        }
    }

    private static error(label: string, message: string, code: number = 500) {
        let kcMainWindow: any = share.BrowserWindow.getAllWindows()[0];
        let msg: IpcMessage = {
            error: {
                label: label,
                message: message,
                code: code
            }, success: undefined
        }
        kcMainWindow.webContents.send('E2A:FileWatcher:Error', msg);
        console.error(`FileWatcher ${label} ${message} (${code})`);
    }

    private static warn(label: string, message: string, code: number = 200) {
        let kcMainWindow: any = share.BrowserWindow.getAllWindows()[0];
        let msg: IpcMessage = {
            error: {
                label: label,
                message: message,
                code: code
            }, success: undefined
        }
        kcMainWindow.webContents.send('E2A:FileWatcher:Warn', msg);
        console.warn(`FileWatcher ${label} ${message} (${code})`);
    }

    private finalize(id: string, method: 'add' | 'remove' | 'delay') {
        let pending = this.pending.find(p => p.id === id);
        if (!pending) {
            console.log('IngestFileWatcher unable to find pending file transfer... ignoring...');
            return
        } else {
            switch (method) {
                case "add":
                    // Add => Remove the `pending` prefix from the file
                    const newPath = pending.newPath.replace(PENDING_PREFIX, '');
                    IngestFileWatcher.move(pending.newPath, newPath);
                    break;
                case "remove":
                    // Remove => Remove new
                    IngestFileWatcher.delete(pending.newPath);
                    break;
                case "delay":
                default:
                    // Delay => Revert new to old
                    IngestFileWatcher.move(pending.newPath, pending.oldPath);
            }
            this.pending = this.pending.filter(p => p.id !== id);
        }
    }

    private static move(from: string, to: string) {
        console.warn(`IngestFileWatcher moving file from ${from} to ${to}`);
        try {
            fs.copyFileSync(from, to);
            fs.rmSync(from);
        } catch (e) {
            IngestFileWatcher.error('Exception', `Failed to move file from ${from} to ${to}`);
        }
    }

    private reset() {
        clearInterval(this.interval);
        this.ingestWatcher = null;
        this.queue = [];

        for (let pending of this.pending) {
            IngestFileWatcher.move(pending.newPath, pending.oldPath);
        }
        this.pending = [];
    }

    private setWatcher(watchPath: string) {
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
                }
            });
    }

    private start(settings: IngestSettingsModel) {
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


                let newFilePath = path.resolve(appEnv.appPath, 'files', `${PENDING_PREFIX}${newId}`) + `.${fileExtension}`;

                // Move the file to its new path.
                fs.copyFileSync(filePath, newFilePath);
                fs.rmSync(filePath);

                // Add this file transfer to the list of pending transfers.
                this.pending.push({
                    id: newId,
                    oldPath: filePath,
                    newPath: newFilePath
                })

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

    private stop() {
        console.log('Shutting down watcher...');

        if (this.ingestWatcher) {
            this.ingestWatcher.close().catch((reason) => {
                console.warn('Ingest file watcher failed to close... ', reason);
            });
        }
        this.reset();
    }
}

const fileWatcher = new IngestFileWatcher();


module.exports = {
    fileWatcher
}
