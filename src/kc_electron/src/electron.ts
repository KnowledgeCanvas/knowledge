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

import {UpdateCheckResult} from "electron-updater";

const {app, BrowserWindow, BrowserView, ipcMain, dialog, shell} = require('electron');
const {autoUpdater} = require("electron-updater");
const nativeImage = require('electron').nativeImage
const http = require('http');
const url = require('url');
const chokidar = require('chokidar');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');
const settingsService = require('./app/controller/settings.service');
const uuid = require('uuid');
const MAIN_ENTRY: string = path.join(app.getAppPath(), 'src', 'kc_angular', 'dist', 'main', 'index.html');

(global as any).share = {
    BrowserView,
    BrowserWindow,
    app,
    autoUpdater,
    dialog,
    fs,
    http,
    ipcMain,
    nativeImage,
    path,
    settingsService,
    shell,
    url,
    uuid,
};

console.log('Dirname: ', __dirname);

// Setup auto update
require('./app/controller/update');

// Setup IPC
require('./app/ipc');

// Setup knowledge source ingestion
require('./app/ingest');

// Start browser extension server
const browserExtensionServer = require('./app/server/server');

const browserIpc = require('./app/ipc').browserIpc;

browserExtensionServer.createServer();

// Get application settings
let appEnv = settingsService.getSettings();

// Declare main window for later use
let kcMainWindow: any;

// Declare window used to display knowledge graphs, etc
let kcKnowledgeWindow: any;

/**
 *
 *
 *
 *
 *
 *
 *
 *
 * Main Window Functions
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 */
function createMainWindow() {
    let WIDTH: number = parseInt(appEnv.DEFAULT_WINDOW_WIDTH);
    let HEIGHT: number = parseInt(appEnv.DEFAULT_WINDOW_HEIGHT);
    let darkMode = appEnv.display.theme.isDark;
    let backgroundColor = darkMode ? '#1E1E1E' : '#F9F9F9';
    console.log('Theme: ', appEnv.display.theme);

    const config = {
        title: 'Knowledge Canvas',
        backgroundColor: backgroundColor,
        width: WIDTH ? WIDTH : 1280,
        height: HEIGHT ? HEIGHT : 1600,
        minWidth: 800,
        minHeight: 800,
        center: true,
        show: false,
        webPreferences: {
            nodeIntegration: false, // is default value after Electron v5
            contextIsolation: true, // protect against prototype pollution
            enableRemoteModule: false, // turn off remote
            preload: path.join(app.getAppPath(), 'src', 'kc_electron', 'dist', 'preload.js')
        }
    };

    kcMainWindow = new BrowserWindow(config);

    setMainWindowListeners();
}

function createKnowledgeWindow() {
    let WIDTH: number = parseInt(appEnv.DEFAULT_WINDOW_WIDTH);
    let HEIGHT: number = parseInt(appEnv.DEFAULT_WINDOW_HEIGHT);
    let darkMode = appEnv.display.theme === 'app-theme-dark';
    let backgroundColor = darkMode ? '#2e2c29' : '#F9F9F9';

    const config = {
        show: false,
        minWidth: 800,
        width: WIDTH ? WIDTH : 1280,
        minHeight: 800,
        height: HEIGHT ? HEIGHT : 1000,
        backgroundColor: backgroundColor,
        title: 'Knowledge Canvas',
        webPreferences: {
            nodeIntegration: false, // is default value after Electron v5
            contextIsolation: true, // protect against prototype pollution
            enableRemoteModule: false, // turn off remote
            preload: path.join(app.getAppPath(), 'src', 'kc_electron', 'dist', 'preload.js')
        }
    };

    kcKnowledgeWindow = new BrowserWindow(config);
    setKnowledgeWindowListeners();
}

function setKnowledgeWindowListeners() {
    // Destroy window on close
    kcKnowledgeWindow.on('closed', function () {
        kcKnowledgeWindow = null;
    });

    kcKnowledgeWindow.once('ready-to-show', () => {
        kcKnowledgeWindow.show();
    });
}

function setMainWindowListeners() {
    // TODO: Determine if the following is the best we can do for page load failure
    // We need to explicitly reload the index upon refresh (note this is only needed in Electron)
    kcMainWindow.webContents.on('did-fail-load', () => {
        browserIpc.destroyBrowserViews(kcMainWindow);
        kcMainWindow.loadFile(MAIN_ENTRY);
    })

    // Destroy window on close
    kcMainWindow.on('closed', function () {
        kcMainWindow = null;
        app.quit();
    });

    // Handle event in which a new window is created (i.e. when a user clicks on a link that is meant to open in new tab, etc)
    kcMainWindow.webContents.on('new-window', (event: any, url: string) => {
        console.log('New window requested: ', url);
        event.preventDefault();
        shell.openExternal(url);
    });

    // Show the window once it's ready
    kcMainWindow.once('ready-to-show', () => {
        kcMainWindow.show();
    });
}

/**
 *
 *
 *
 *
 *
 *
 *
 *
 * Set APP listeners
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 */

app.on('window-all-closed', function () {
    // MacOS apps typically do not quit all the way when a window is closed...
    if (process.platform !== 'darwin')
        app.quit()
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow();
    }
});


app.on('ready', function () {
    // Create window but wait to load and show until after update
    createMainWindow();

    autoUpdater.checkForUpdatesAndNotify().then((update: UpdateCheckResult | null) => {
        if (update) {
            console.log('Update Check Results: ', update);
        }
    }).catch((reason: any) => {
        console.error('Update Check Error: ', reason);
    }).finally(() => {
        kcMainWindow.loadFile(MAIN_ENTRY);
    })
});


/**
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 */
let ingestWatcher: any;
let filesToPush: any[] = [];
let autoScanInterval: any = undefined;

/**
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 */
// Subscribes to ingest settings in order to enable/disable file watcher...
// TODO: move this elsewhere.... IPC perhaps?
// settingsService.ingest.subscribe((ingest: any) => {
//     if (!ingest || !ingest.autoscan || !ingest.autoscanLocation) {
//         if (ingestWatcher)
//             ingestWatcher.close();
//         clearInterval(autoScanInterval);
//         return;
//     }
//
//     // If watcher already exists, close it for now so we can apply new settings
//     if (ingestWatcher) {
//         ingestWatcher.close();
//     }
//     clearInterval(autoScanInterval);
//     ingestWatcher = null;
//     filesToPush = [];
//
//     let watchPath = path.resolve(ingest.autoscanLocation);
//
//     let fileStat: any;
//     try {
//         fileStat = fs.statSync(watchPath);
//     } catch (e) {
//         console.warn('Could not find directory: ', watchPath, '... creating now...');
//         fs.mkdirSync(watchPath, {recursive: true});
//     }
//
//     ingestWatcher = chokidar.watch(watchPath, {
//         // intended behavior: ignore dotfiles
//         ignored: /(^|[\/\\])\../,
//
//         // intended behavior: keep the file watcher running as long as the user has 'Autoscan' enabled
//         persistent: true,
//
//         // intended behavior: if the user doesn't move the files, then we shouldn't touch them and show them next time
//         ignoreInitial: false
//     });
//
//     ingestWatcher.on('add', (filePath: string) => {
//         fileStat = fs.statSync(filePath);
//
//         if (!fileStat) {
//             console.error('Failed to read file: ', filePath);
//             return;
//         }
//
//         console.log('New file found by watcher: ', filePath);
//
//         // Create new file name based on UUID and file type extension, then copy to assigned directory
//         const contentType = mime.lookup(filePath);
//
//         // TODO: this might be set to "false", so we'll have to manually grab the extension if so...
//         let fileExtension = mime.extension(contentType);
//         if (!fileExtension) {
//             console.warn('Could not find file extension for filePath: ', filePath);
//             fileExtension = path.extname(filePath).split('.')[1];
//             console.warn('Using path extname instead: ', fileExtension);
//         }
//
//
//         let newId = uuid.v4();
//         let newFilePath = path.resolve(appEnv.appPath, 'files', newId) + `.${fileExtension}`;
//
//         // copyFileToFolder(filePath, newFilePath);
//
//         // Prepare file model to be sent to ingest watcher service in Angular
//         let fileModel: FileModel = {
//             accessTime: ingest.preserveTimestamps ? fileStat.atime : Date(),
//             creationTime: ingest.preserveTimestamps ? fileStat.ctime : Date(),
//             modificationTime: ingest.preserveTimestamps ? fileStat.mtime : Date(),
//             filename: path.basename(filePath),
//             id: {value: newId},
//             path: newFilePath,
//             size: fileStat.size,
//             type: contentType
//         }
//
//         // Add it to the queue
//         filesToPush.push(fileModel);
//
//
//         // Delete file in watched directory (since it has a new home)
//         console.warn('Deleting file: ', filePath);
//         // TODO: file deletion should only occur after we verify that the new KS has been received in the app...
//         // fs.rmSync(filePath);
//     });
//
//     // Create a new period check for files based on user interval
//     console.log('Setting interval to ', ingest.interval / 1000, ' seconds...');
//     autoScanInterval = setInterval(() => {
//         console.log('Checking filesToPush: ', filesToPush);
//         if (filesToPush.length > 0 && ingest.autoscan) {
//             let responses: any[] = [];
//
//             for (let fileToPush of filesToPush) {
//                 let response: IpcMessage = {
//                     error: undefined,
//                     success: {
//                         data: fileToPush
//                     }
//                 }
//                 responses.push(response)
//             }
//             try {
//                 kcMainWindow.webContents.send('app-ingest-watcher-results', responses);
//                 filesToPush = [];
//             } catch (e) {
//                 console.warn('Unable to push files to main window... trying again later...');
//             }
//         }
//
//     }, appEnv.ingest.interval);
// });

function copyFileToFolder(filePath: string, newFilePath: string) {
    fs.copyFileSync(filePath, newFilePath);
}


/**
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 */
