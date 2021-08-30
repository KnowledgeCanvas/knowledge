import {IpcResponse, KcUuidRequest, KsBrowserViewRequest, KsThumbnailRequest} from "./app/model/ipc.model";
import {SettingsModel} from "./app/model/settings.model";

const {app, BrowserWindow, BrowserView, ipcMain, dialog, webContents, shell} = require('electron');

const nativeImage = require('electron').nativeImage
const http = require('http');
const url = require('url');

const fs = require('fs');
const os = require('os');
const path = require('path');

const scriptService = require('./app/controller/script.service');
const settingsService = require('./app/controller/settings.service');
const uuid = require('uuid');

const DEBUG: boolean = true;
const MAIN_ENTRY: string = path.join(app.getAppPath(), 'src', 'kc_angular', 'dist', 'main', 'index.html')
const SETUP_ENTRY: string = path.join(app.getAppPath(), 'src', 'kc_angular', 'dist', 'setup', 'index.html')

let kcMainWindow: typeof BrowserWindow;
let appEnv = settingsService.getSettings();

console.log('Dirname: ', __dirname);

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
            preload: path.join(app.getAppPath(), 'src', 'kc_electron', 'dist', 'preload.js')
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

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
    process.exit(0);
});

app.whenReady().then(() => {
    kcMainWindow = createMainWindow();
    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
    })
})


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
    const correctRange = 0 < args.quantity && args.quantity <= 128;
    console.log(containsQuantity, correctType, correctRange);
    return containsQuantity && correctType && correctRange;
}

ipcMain.on('electron-open-local-file', (event: any, filePath: string) => {
    console.log('Received request to open local file: ', filePath);
    shell.openPath(path.resolve(filePath));
});

ipcMain.on('electron-get-file-thumbnail', (event: any, requests: KsThumbnailRequest[]) => {
    let responses: IpcResponse[] = [];


    if (requests.length <= 0) {
        responses = [{
            error: {
                code: 412,
                label: http.STATUS_CODES['412'],
                message: 'Invalid thumbnail request.'
            }, success: undefined
        }]
        kcMainWindow.webContents.send('electron-get-file-thumbnail-results', responses);
        return;
    }


    let actions: any[] = [];

    for (let request of requests) {
        console.log('Processing request: ', request);
        if (request.height && request.width)
            actions.push(nativeImage.createThumbnailFromPath(path.resolve(request.path), {width: request.width, height: request.height}));
        else
            actions.push(nativeImage.createThumbnailFromPath(path.resolve(request.path), {width: 800, height: 1600}));
    }


    Promise.all(actions).then((thumbnails) => {
        console.log('Received ', thumbnails.length, ' thumbnails...');
        for (let thumbnail of thumbnails) {
            let response: IpcResponse = {
                error: undefined,
                success: {data: thumbnail.toDataURL()}
            }
            responses.push(response);
        }
        kcMainWindow.webContents.send('electron-get-file-thumbnail-results', responses);
    }).catch((reason) => {
        console.error('Caught promise exception while getting thumbnail: ', reason);
    });
});

ipcMain.on('electron-get-file-icon', (event: any, filePaths: string[]) => {
    if (filePaths.length <= 0) {
        return;
    }
    let actions: any[] = [];

    let options = {
        size: 'normal'
    }
    for (let filePath of filePaths) {
        actions.push(app.getFileIcon(path.resolve(filePath), options));
    }

    let responses: IpcResponse[] = [];

    Promise.all(actions).then((icons) => {
        for (let icon of icons) {
            let response: IpcResponse = {
                error: undefined,
                success: {data: icon.toDataURL()}
            }
            responses.push(response);
        }
        kcMainWindow.webContents.send('electron-get-file-icon-results', responses);
    });
});

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
