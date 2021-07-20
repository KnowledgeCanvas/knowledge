const {app, BrowserWindow, ipcMain, dialog} = require('electron')
const path = require('path')
import {SettingsModel} from "./app/model/settings.model";

const settingsService = require('./app/controller/settings.service');
let appEnv = settingsService.getSettings();

const DEBUG: boolean = true;
const MAIN_ENTRY: string = path.join(app.getAppPath(), 'kc_workspace', 'dist', 'main', 'index.html')
const SETUP_ENTRY: string = path.join(app.getAppPath(), 'kc_workspace', 'dist', 'setup', 'index.html')
const windows = new Set();

console.log('Dirname: ', __dirname);

function createMainWindow() {
    console.log('Startup URL entry point is: ', MAIN_ENTRY);
    let WIDTH: number = parseInt(appEnv.DEFAULT_WINDOW_WIDTH);
    let HEIGHT: number = parseInt(appEnv.DEFAULT_WINDOW_HEIGHT);
    const config = {
        show: false,
        width: WIDTH ? WIDTH : 900,
        height: HEIGHT ? HEIGHT : 1300,
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(app.getAppPath(), 'kc_electron', 'dist', 'preload.js')
        }
    };

    let mainWindow: typeof BrowserWindow = new BrowserWindow(config);

    // TODO: Determine if the following is the best we can do for page load failure
    // We need to explicitly reload the index upon refresh (note this is only needed in Electron)
    mainWindow.webContents.on('did-fail-load', () => {
        mainWindow.loadFile(MAIN_ENTRY);
    })

    // Destroy window on close
    mainWindow.on('closed', function () {
        windows.delete(mainWindow);
        mainWindow = null;
    });

    windows.add(mainWindow);
    mainWindow.loadFile(MAIN_ENTRY);
    mainWindow.show();

    return mainWindow;
}


const createStartupWindow = exports.createStartupWindow = () => {
    console.log('Startup URL is: ', SETUP_ENTRY);
    let WIDTH: number = parseInt(appEnv.STARTUP_WINDOW_WIDTH);
    let HEIGHT: number = parseInt(appEnv.STARTUP_WINDOW_HEIGHT);
    let newWindow = new BrowserWindow({
        show: false,
        width: WIDTH ? WIDTH : 600,
        height: HEIGHT ? HEIGHT : 600,
        resizable: true,
        // autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true
        }
    });

    newWindow.loadFile(SETUP_ENTRY);

    newWindow.webContents.on('did-fail-load', () => {
        setTimeout(() => {
            newWindow.loadFile(SETUP_ENTRY);
        }, 500);
    })

    // TODO: Account for the fact that the user can close this window at any time, even if the setup is not complete.
    newWindow.on('close', () => {
        windows.delete(newWindow);
        newWindow = null;
        appEnv = settingsService.getSettings();

        if (!appEnv.firstRun) {
            createMainWindow();
        } else {
            // TODO: the `firstRun` setting should only be set to false after use goes through initial setup
            let updatedSettings: SettingsModel = {firstRun: false};

            settingsService.setSettings(updatedSettings).then((resolve: SettingsModel, reject: any) => {
                if (resolve)
                    console.log("firstRun set to false");
            });
        }
    })

    windows.add(newWindow);
    newWindow.show()
    return newWindow;
}


app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
    process.exit(0);
});

app.whenReady().then(() => {
    if (appEnv?.firstRun) {
        createStartupWindow();
    } else {
        createMainWindow();
    }

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
    })
})
