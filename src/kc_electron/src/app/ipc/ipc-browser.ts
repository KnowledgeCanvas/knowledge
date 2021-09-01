import {IpcResponse, KsBrowserViewRequest} from "../models/electron.ipc.model";

const share: any = (global as any).share;
const BrowserWindow: any = share.BrowserWindow;
const ipcMain: any = share.ipcMain;
const http: any = share.http;
const path: any = share.path;
const fs: any = share.fs;
const settingsService: any = share.settingsService;
const BrowserView: any = share.BrowserView;

let extractWebsite, closeBroserView, openBrowserView;
module.exports = {extractWebsite, closeBroserView, openBrowserView}

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
extractWebsite = ipcMain.on("app-extract-website", (event: any, args: any) => {
    let kcMainWindow: any = share.BrowserWindow.getAllWindows()[0];

    if (!args.url || !args.filename) {
        kcMainWindow.webContents.send("app-extract-website-results", false);
    }

    let appEnv = settingsService.getSettings();

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
closeBroserView = ipcMain.on("electron-close-browser-view", () => {
    let kcMainWindow: any = share.BrowserWindow.getAllWindows()[0];
    let allViews = kcMainWindow.getBrowserViews();
    kcMainWindow.setBrowserView(null);
    for (let view of allViews) {
        view.webContents.destroy();
    }
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
openBrowserView = ipcMain.on('electron-browser-view', (event: any, args: KsBrowserViewRequest) => {
    let kcMainWindow: any = share.BrowserWindow.getAllWindows()[0];
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
