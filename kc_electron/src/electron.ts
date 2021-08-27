const {app, BrowserWindow, BrowserView, ipcMain, dialog, webContents, shell} = require('electron');
import {SettingsModel} from "./app/model/settings.model";

const http = require('http');
const url = require('url');

const fs = require('fs');
const os = require('os');
const path = require('path');

const scriptService = require('./app/controller/script.service');
const settingsService = require('./app/controller/settings.service');
const uuid = require('uuid');

const DEBUG: boolean = true;
const MAIN_ENTRY: string = path.join(app.getAppPath(), 'kc_workspace', 'dist', 'main', 'index.html')
const SETUP_ENTRY: string = path.join(app.getAppPath(), 'kc_workspace', 'dist', 'setup', 'index.html')

let kcMainWindow: typeof BrowserWindow;
let appEnv = settingsService.getSettings();

console.log('Dirname: ', __dirname);
console.log('Http status codes: ', http.STATUS_CODES);

http.createServer((req: any, res: any) => {
    let q = url.parse(req.url, true).query;

    if (q.link) {
        console.log(q.link);
        kcMainWindow.webContents.send('app-chrome-extension-results', q.link);
        res.end("Done");
    } else {
        console.error('Received invalid link from Chrome extension...');
        res.end('Failed');
    }
}).listen(9000)

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
        webPreferences: {
            nodeIntegration: false, // is default value after Electron v5
            contextIsolation: true, // protect against prototype pollution
            enableRemoteModule: false, // turn off remote
            preload: path.join(app.getAppPath(), 'kc_electron', 'dist', 'preload.js')
        }
    };

    kcMainWindow = new BrowserWindow(config);

    // TODO: Determine if the following is the best we can do for page load failure
    // We need to explicitly reload the index upon refresh (note this is only needed in Electron)
    kcMainWindow.webContents.on('did-fail-load', () => {
        kcMainWindow.loadFile(MAIN_ENTRY);
    })

    // Destroy window on close
    kcMainWindow.on('closed', function () {
        kcMainWindow = null;
    });

    kcMainWindow.webContents.on('new-window', (event: any, url: string) => {
        // event.preventDefault();
        // shell.openPath(url);
    });

    kcMainWindow.loadFile(MAIN_ENTRY);
    kcMainWindow.show();

    return kcMainWindow;
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
        kcMainWindow = createMainWindow();
    }

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
    })
})

interface IpcSuccess {
    message?: string;
    data?: any;
}

interface IpcError {
    code: number;
    label: string;
    message: string;
}

interface IpcResponse {
    error: IpcError | undefined;
    success: IpcSuccess | undefined;
}

interface KcUuidRequest {
    quantity: number
}

interface KsBrowserViewRequest {
    url: string,
    x: number,
    y: number,
    height: number,
    width: number
}

function isKsBrowserViewRequest(arg: any): arg is KsBrowserViewRequest {
    const containsArgs = arg && arg.url && arg.x && arg.y && arg.height && arg.width
    const correctTypes = typeof (arg.url) === 'string'
        && typeof (arg.height) === 'number' && typeof (arg.x) === 'number'
        && typeof (arg.width) === 'number' && typeof (arg.y) === 'number';
    if (!containsArgs) console.warn('KsBrowserViewRequest does not contain the necessary fields.');
    if (!correctTypes) console.warn('KsBrowserViewRequest item types are invalid.');
    // TODO: Make sure these values are also within the bounds of the main window as an extra sanity check
    return containsArgs && correctTypes;
}

function isKcUuidRequest(args: any): args is KcUuidRequest {
    const containsQuantity = args && args.quantity;
    const correctType = typeof (args.quantity) === 'number';
    const correctRange = 0 < args.quantity && args.quantity <= 64;
    console.log(containsQuantity, correctType, correctRange);
    return containsQuantity && correctType && correctRange;
}

ipcMain.on('electron-browser-view', (event: any, args: KsBrowserViewRequest) => {
    let response: IpcResponse = {
        error: undefined,
        success: undefined
    }

    // ---------------------------------------------------------------------------
    // Argument validation
    if (!isKsBrowserViewRequest(args)) {
        const message = `electron-browser-view argument does not conform to KsBrowserViewRequest`;
        response.error = {code: 412, label: http.STATUS_CODES['412'], message: message};
        console.warn(response.error);
        kcMainWindow.webContents.send('electron-browser-view-results', response);
        return;
    }

    // ---------------------------------------------------------------------------
    // Construct BrowserView, set parameters, and attach to main window
    const viewUrl = new URL(args.url), x = args.x, y = args.y, width = args.width, height = args.height;
    const kcBrowserView = new BrowserView({show: false});

    kcMainWindow.setBrowserView(kcBrowserView);
    kcBrowserView.setBounds({x: x, y: y, width: width, height: height});
    kcBrowserView.setAutoResize({width: true, height: true, horizontal: true, vertical: true});
    kcBrowserView.webContents.loadURL(viewUrl.href);
    kcBrowserView.webContents.on('dom-ready', function () {
        response.success = {message: 'Success. DOM-ready triggered.'}
        kcMainWindow.webContents.send('electron-browser-view-results', response);
    });
});

ipcMain.on("electron-close-browser-view", () => {
    let allViews = kcMainWindow.getBrowserViews();
    kcMainWindow.setBrowserView(null);
    for (let view of allViews) {
        view.webContents.destroy();
    }
});

ipcMain.on('electron-browser-view-file', (event: any, args: object) => {
    console.log('Electron Browser View from file generated from args: ', args);
    kcMainWindow.webContents.send('electron-browser-view-file-results', args);

    // TODO: Decide if we want to implement this and what it would look like...
    // const contentBounds = win.getContentBounds();
    // console.log('Content Bounds: ', win.getContentBounds());
    // let x = contentBounds.width * 0.12;
    // let y = contentBounds.height * 0.12;
    // let width = contentBounds.width * 0.70;
    // let height = contentBounds.height * 0.70;
    //
    // const view = new BrowserView();
    // win.setBrowserView(view);
    // view.setBounds({x: x, y: y, width: width, height: height});
    // view.webContents.loadURL(url);
});

ipcMain.on("app-search-python", (event: any, args: object) => {
    console.log('Search invoked on search term: ', args);
    scriptService.runPythonScript('search', args).then((value: string) => {
        kcMainWindow.webContents.send("app-search-python-results", value);
    }).catch((reason: any) => {
        console.error(reason);
    });
});

ipcMain.on("app-generate-uuid", (event: any, args: any) => {
    let response: IpcResponse = {
        error: undefined,
        success: undefined
    }
    if (!isKcUuidRequest(args)) {
        const message = `electron-generate-uuid argument does not conform to KcUuidRequest`;
        response.error = {code: 412, label: http.STATUS_CODES['412'], message: message};
        console.warn(response.error);
        kcMainWindow.webContents.send('electron-browser-view-results', response);
        return;
    }
    let ids = [];
    for (let i = 0; i < args.quantity; i++) {
        let id = uuid.v4();
        if (i === 0)
            ids = [id];
        else
            ids.push(id);
    }
    response.success = {data: ids};
    kcMainWindow.webContents.send("app-generate-uuid-results", response);
});

ipcMain.on("app-get-settings", (event: any, args: object) => {
    console.log('Getting settings...');
    appEnv = settingsService.getSettings();
    kcMainWindow.webContents.send("app-get-settings-results", appEnv);
});

ipcMain.on("app-save-settings", (event: any, args: any) => {
    console.log('Saving settings: ', args);
    appEnv = {...appEnv, ...args};
    settingsService.setSettings(appEnv).then((settings: SettingsModel) => {
        appEnv = settings;
    });
    kcMainWindow.webContents.send("app-save-settings-results", appEnv);
});

ipcMain.on("app-extract-website", (event: any, args: any) => {
    if (args.url && args.filename) {
        console.log('Attempting to extract from webpage: ', args?.url);
        const pdfPath = path.join(appEnv.pdfPath, args.filename + '.pdf');

        const options = {
            width: 1280,
            height: 1000,
            marginsType: 0,
            pageSize: 'A4',
            printBackground: true,
            fullscreenable: false,
            printSelectionOnly: false,
            landscape: false,
            parent: kcMainWindow,
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

                    kcMainWindow.webContents.send("app-extract-website-results", pdfPath);
                    window.close();
                }).catch((error: any) => {
                    console.log(`Failed to write PDF to ${pdfPath}: `, error);
                    kcMainWindow.webContents.send("app-extract-website-results", error);
                    window.close();
                });
            }, 2000);
        });

    } else {
        kcMainWindow.webContents.send("app-extract-website-results", false);
    }
});
