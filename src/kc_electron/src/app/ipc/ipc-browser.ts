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

import {IpcMessage, KsBrowserViewRequest, KsBrowserViewResponse} from "../models/electron.ipc.model";
import {Menu, MenuItem} from "electron";

const share: any = (global as any).share;
const BrowserWindow: any = share.BrowserWindow;
const ipcMain: any = share.ipcMain;
const http: any = share.http;
const path: any = share.path;
const fs: any = share.fs;
const settingsService: any = share.settingsService;
const BrowserView: any = share.BrowserView;

let extractWebsite, closeBrowserView, openBrowserView, destroyBrowserViews: (kcMainWindow: any) => void;

let browserViewEventListeners = [
    'A2E:BrowserView:CanGoBack',
    'A2E:BrowserView:CanGoForward',
    'A2E:BrowserView:CurrentUrl',
    'A2E:BrowserView:GoBack',
    'A2E:BrowserView:GoForward',
    'A2E:BrowserView:Refresh'
];

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
extractWebsite = ipcMain.on("A2E:Extraction:Website", (event: any, args: any) => {
    let kcMainWindow: any = share.BrowserWindow.getAllWindows()[0];

    if (!args.url || !args.filename) {
        kcMainWindow.webContents.send("E2A:Extraction:Website", false);
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
        console.debug('DOM ready, waiting 2 seconds for renderer to catch up...');
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

                kcMainWindow.webContents.send("E2A:Extraction:Website", pdfPath);
                window.close();
            }).catch((error: any) => {
                console.log(`Failed to write PDF to ${pdfPath}: `, error);
                kcMainWindow.webContents.send("E2A:Extraction:Website", error);
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

destroyBrowserViews = (kcMainWindow: any) => {
    let allViews = kcMainWindow.getBrowserViews();
    kcMainWindow.setBrowserView(null);
    for (let view of allViews) {
        view.webContents.destroy();
    }
}

closeBrowserView = ipcMain.on('A2E:BrowserView:Close', () => {
    let kcMainWindow: any = share.BrowserWindow.getAllWindows()[0];
    destroyBrowserViews(kcMainWindow);

    // Remove all ipcMain event listeners associated with any existing browser view
    for (let bvEventListener of browserViewEventListeners) {
        ipcMain.removeAllListeners(bvEventListener);
    }

    let response: IpcMessage = {
        error: undefined,
        success: {data: true}
    }

    kcMainWindow.webContents.send('E2A:BrowserView:Close', response);
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
openBrowserView = ipcMain.on('A2E:BrowserView:Open', (event: any, args: KsBrowserViewRequest) => {
    let kcMainWindow: any = share.BrowserWindow.getAllWindows()[0];
    let response: IpcMessage = {
        error: undefined,
        success: undefined
    }
    let navEventsResponse: IpcMessage = {
        error: undefined,
        success: undefined
    }

    // ---------------------------------------------------------------------------
    // Argument validation
    if (!isKsBrowserViewRequest(args)) {
        const message = `A2E:BrowserView:Open argument does not conform to KsBrowserViewRequest`;
        response.error = {code: 412, label: http.STATUS_CODES['412'], message: message};
        console.warn(response.error);
        kcMainWindow.webContents.send('E2A:BrowserView:Open', response);
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

    /**
     * BrowserView event listeners
     */
    kcBrowserView.webContents.on('dom-ready', function () {
        kcBrowserView.setBackgroundColor('#ffffff');
        if (args.returnHtml) {
            let js = [
                kcBrowserView.webContents.executeJavaScript('document.getElementsByTagName(\'html\')[0].innerHTML;'),
                kcBrowserView.webContents.executeJavaScript('window.getComputedStyle(document.body, null).backgroundColor;')
            ]
            Promise.all(js).then((values) => {
                let data: KsBrowserViewResponse = {
                    html: values[0],
                    backgroundColor: values[1]
                };
                response.success = {
                    message: 'Success. DOM-ready triggered.',
                    data: data
                }
                kcMainWindow.webContents.send('E2A:BrowserView:Open', response);

            }).catch((error) => {
                console.error(error);
            });
        } else {
            response.success = {
                message: 'Success. DOM-ready triggered.'
            }
            kcMainWindow.webContents.send('E2A:BrowserView:Open', response);
        }
    });

    kcBrowserView.webContents.on('did-navigate', (event: any, url: any) => {
        navEventsResponse = {
            error: undefined,
            success: {data: url}
        }
        kcMainWindow.webContents.send('E2A:BrowserView:NavEvent', navEventsResponse);
    });

    kcBrowserView.webContents.on('did-navigate-in-page', (event: any, url: any) => {
        navEventsResponse = {
            error: undefined,
            success: {data: url}
        }
        kcMainWindow.webContents.send('E2A:BrowserView:NavEvent', navEventsResponse);
    });


    let rightClickPosition: any = null
    let selectedText: string = '';
    const menu = new Menu()
    const extractOption = new MenuItem(({
        label: 'Extract Text',
        click: (menuItem, browserWindow, event) => {
            console.log('MenuItem: ', menuItem);
            console.log('Browser Window: ', browserWindow);
            console.log('Event: ', event);
            console.log('Extracting text: ', selectedText);

            const data = {
                text: selectedText,
                url: args.url
            }

            kcMainWindow.webContents.send('E2A:BrowserView:ExtractedText', data);
        }
    }))
    menu.append(extractOption)

    kcBrowserView.webContents.on('context-menu', (e: any, params: any) => {
        e.preventDefault()
        console.log('Context menu event: ', e.session);
        rightClickPosition = {x: params.x, y: params.y}
        selectedText = params.selectionText;
        menu.popup(kcBrowserView)
    }, false)


    /**
     * ipcMain event listeners that rely on having a browserview open
     * These MUST be removed when the browser view is closed (see above function for browser-view-close)
     */
    ipcMain.on('A2E:BrowserView:CanGoBack', (_: any) => {
        if (!kcBrowserView.webContents)
            return;
        let response: IpcMessage = {
            error: undefined,
            success: {data: kcBrowserView.webContents.canGoBack()}
        }
        kcMainWindow.webContents.send('E2A:BrowserView:CanGoBack', response);
    });

    ipcMain.on('A2E:BrowserView:CanGoForward', (_: any) => {
        if (!kcBrowserView.webContents)
            return;
        let response: IpcMessage = {
            error: undefined,
            success: {data: kcBrowserView.webContents.canGoForward()}
        }
        kcMainWindow.webContents.send('E2A:BrowserView:CanGoForward', response);
    });

    ipcMain.on('A2E:BrowserView:CurrentUrl', (_: any) => {
        if (!kcBrowserView.webContents)
            return;
        let response: IpcMessage = {
            error: undefined,
            success: {data: kcBrowserView.webContents.getURL()}
        }
        kcMainWindow.webContents.send('E2A:BrowserView:CurrentUrl', response);
    });

    ipcMain.on('A2E:BrowserView:GoBack', (_: any) => {
        if (!kcBrowserView.webContents)
            return;
        if (kcBrowserView.webContents) {
            kcBrowserView.webContents.goBack();
        }
    });

    ipcMain.on('A2E:BrowserView:GoForward', (_: any) => {
        if (!kcBrowserView.webContents)
            return;
        if (kcBrowserView.webContents) {
            kcBrowserView.webContents.goForward();
        }
    });

    ipcMain.on('A2E:BrowserView:Refresh', (_: any) => {
        if (!kcBrowserView.webContents)
            return;
        if (kcBrowserView.webContents) {
            kcBrowserView.webContents.reload();
        }
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
    const containsArgs = arg
        && arg.url !== undefined
        && arg.x !== undefined
        && arg.y !== undefined
        && arg.height !== undefined
        && arg.width !== undefined
    const correctTypes = typeof (arg.url) === 'string'
        && typeof (arg.height) === 'number' && typeof (arg.x) === 'number'
        && typeof (arg.width) === 'number' && typeof (arg.y) === 'number';
    if (!containsArgs) console.warn('KsBrowserViewRequest does not contain the necessary fields.');
    if (!correctTypes) console.warn('KsBrowserViewRequest item types are invalid.');
    // TODO: Make sure these values are also within the bounds of the main window as an extra sanity check
    return containsArgs && correctTypes;
}


module.exports = {extractWebsite, closeBrowserView, openBrowserView, destroyBrowserViews}
