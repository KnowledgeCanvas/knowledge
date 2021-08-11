const {app, BrowserWindow, ipcMain, dialog, webContents, shell} = require('electron')
import {SettingsModel} from "./app/model/settings.model";
const fs = require('fs');
const os = require('os')
const path = require('path')
const scriptService = require('./app/controller/script.service');
const settingsService = require('./app/controller/settings.service');

const DEBUG: boolean = true;
const MAIN_ENTRY: string = path.join(app.getAppPath(), 'kc_workspace', 'dist', 'main', 'index.html')
const SETUP_ENTRY: string = path.join(app.getAppPath(), 'kc_workspace', 'dist', 'setup', 'index.html')

let win: typeof BrowserWindow;
let appEnv = settingsService.getSettings();

console.log('Dirname: ', __dirname);

function createMainWindow() {
    console.log('Startup URL entry point is: ', MAIN_ENTRY);
    let WIDTH: number = parseInt(appEnv.DEFAULT_WINDOW_WIDTH);
    let HEIGHT: number = parseInt(appEnv.DEFAULT_WINDOW_HEIGHT);
    console.log('Starting with window sizes: ', WIDTH, HEIGHT);
    const config = {
        show: false,
        width: WIDTH ? WIDTH : 1280,
        height: HEIGHT ? HEIGHT : 1000,
        title: 'Knowledge Canvas',
        minHeight: 1000,
        minWidth: 1280,
        webPreferences: {
            nodeIntegration: false, // is default value after Electron v5
            contextIsolation: true, // protect against prototype pollution
            enableRemoteModule: false, // turn off remote
            preload: path.join(app.getAppPath(), 'kc_electron', 'dist', 'preload.js')
        }
    };

    win = new BrowserWindow(config);

    // TODO: Determine if the following is the best we can do for page load failure
    // We need to explicitly reload the index upon refresh (note this is only needed in Electron)
    win.webContents.on('did-fail-load', () => {
        win.loadFile(MAIN_ENTRY);
    })

    // Destroy window on close
    win.on('closed', function () {
        win = null;
    });

    // win.webContents.on('new-window', (event: any, url: string) => {
    //     event.preventDefault();
    //     shell.openExternal(url);
    // });

    win.loadFile(MAIN_ENTRY);
    win.show();

    return win;
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
            nodeIntegration: false, // is default value after Electron v5
            contextIsolation: true, // protect against prototype pollution
            enableRemoteModule: false, // turn off remote
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
        win = createMainWindow();
    }

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
    })
})

ipcMain.on("app-search-python", (event: any, args: object) => {
    console.log('Search invoked on search term: ', args);
    scriptService.runPythonScript('search', args).then((value: string) => {
        win.webContents.send("app-search-python-results", value);
    }).catch((reason: any) => {
        console.error(reason);
    });
});

ipcMain.on("app-extract-webpage", (event: any, args: any) => {
    if (args.url && args.filename) {
        console.log('Attempting to extract from webpage: ', args?.url);
        const pdfPath = path.join(os.homedir(), 'Desktop', args.filename+'.pdf');

        const options = {
            width: 1280,
            height: 1000,
            marginsType: 0,
            pageSize: 'A4',
            printBackground: true,
            fullscreenable: false,
            printSelectionOnly: false,
            landscape: false,
            parent: win,
            show: false
        }

        const window = new BrowserWindow(options);
        window.loadURL(args.url);

        window.on('close', () => {
           console.log('Window was closed...');
        });

        window.webContents.once('dom-ready', () => {
            console.log('DOM ready, waiting 3 seconds for renderer to catch up...');
            setTimeout(() => {
                console.log('Calling printToPDF with options: ', options);
                window.webContents.printToPDF(options).then((data: any) => {
                    console.log('PDF has been retrieved... attempting to write to file...');

                    fs.writeFile(pdfPath, data, (error: any) => {
                        if (error) {
                            console.error('Unable to write PDF to ', pdfPath);
                            console.error(error);
                            throw error;
                        }
                        console.log(`Wrote PDF successfully to ${pdfPath}`);
                    });

                    win.webContents.send("app-extract-webpage-results", pdfPath);
                    window.close();
                }).catch((error: any) => {
                    console.log(`Failed to write PDF to ${pdfPath}: `, error);
                    win.webContents.send("app-extract-webpage-results", error);
                    window.close();
                });
            }, 2000);
        });

    } else {
        win.webContents.send("app-extract-webpage-results", false);
    }
});
