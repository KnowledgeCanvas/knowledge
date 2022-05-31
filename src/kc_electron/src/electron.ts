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
const fs = require('fs');
const path = require('path');
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

const browserIpc = require('./app/ipc').browserIpc;


// Get application settings
let appEnv = settingsService.getSettings();

// Declare main window for later use
let kcMainWindow: any;

if (!appEnv.ingest.extensions) {
    appEnv.ingest.extensions = {
        httpServerEnabled: false,
        httpServerPort: 9000
    }
    settingsService.setSettings(appEnv);
}

if (appEnv.ingest.extensions.httpServerEnabled) {
    // Start browser extension server
    console.debug('Starting browser extension server...');
    const browserExtensionServer = require('./app/server/server').kcExtensionServer;
    browserExtensionServer.start();
}

/**
 * Main Window Functions
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
