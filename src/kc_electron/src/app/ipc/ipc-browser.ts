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
import {escape} from "querystring";

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
    'electron-browser-view-can-go-back',
    'electron-browser-view-can-go-forward',
    'electron-browser-view-current-url',
    'electron-browser-view-go-back',
    'electron-browser-view-go-forward',
    'electron-browser-view-refresh'
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

destroyBrowserViews = (kcMainWindow: any) => {
    let allViews = kcMainWindow.getBrowserViews();
    kcMainWindow.setBrowserView(null);
    for (let view of allViews) {
        view.webContents.destroy();
    }
}

closeBrowserView = ipcMain.on('electron-close-browser-view', () => {
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

    kcMainWindow.webContents.send('electron-close-browser-view-results', response);
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
                kcMainWindow.webContents.send('electron-browser-view-results', response);

            }).catch((error) => {
                console.error(error);
            });
        } else {
            response.success = {
                message: 'Success. DOM-ready triggered.'
            }
            kcMainWindow.webContents.send('electron-browser-view-results', response);
        }
    });

    kcBrowserView.webContents.on('did-navigate', (event: any, url: any) => {
        navEventsResponse = {
            error: undefined,
            success: {data: url}
        }
        kcMainWindow.webContents.send('electron-browser-view-nav-events', navEventsResponse);
    });

    kcBrowserView.webContents.on('did-navigate-in-page', (event: any, url: any) => {
        navEventsResponse = {
            error: undefined,
            success: {data: url}
        }
        kcMainWindow.webContents.send('electron-browser-view-nav-events', navEventsResponse);
    });


    let rightClickPosition: any = null
    let selectedText: string = '';
    const menu = new Menu()
    const menuItem = new MenuItem({
        label: 'Highlight',
        click: (_: any) => {
            if (selectedText.length) {
                // See https://github.com/GoogleChromeLabs/link-to-text-fragment#background for info on text fragments

                let words = selectedText.split(' ');

                if (words.length > 128) {
                    console.warn('Arbitrary character limit on text selection...');
                    return;
                } else if (words.length > 3) {
                    let prefix = escape(words.slice(0, 2).join(' '));
                    let suffix = escape(words.slice(words.length - 2).join(' '));
                    selectedText = `#:~:text=${prefix},${suffix}`;
                } else {
                    selectedText = `#:~:text=${escape(selectedText)}`;
                }
                let location = kcBrowserView.webContents.getURL();
                kcBrowserView.webContents.loadURL(location + selectedText);
            } else {
                console.warn('No text to extract...');
            }
        }
    })
    menu.append(menuItem)

    kcBrowserView.webContents.on('context-menu', (e: any, params: any) => {
        e.preventDefault()
        console.log('Context menu event: ', e.session);
        rightClickPosition = {x: params.x, y: params.y}
        selectedText = params.selectionText;
        console.log('BrowserView Title: ', kcBrowserView.webContents.getTitle());
        console.log('Link URL: ', params.linkURL);
        console.log('Source URL: ', params.srcURL);
        console.log('Page URL: ', params.pageURL);
        console.log('Link text: ', params.linkText);
        console.log('Title text: ', params.titleText);
        console.log('Selected text: ', params.selectionText);
        console.log('Selection rectangle: ', params.selectionRect);
        menu.popup(kcBrowserView)
    }, false)


    /**
     * ipcMain event listeners that rely on having a browserview open
     * These MUST be removed when the browser view is closed (see above function for browser-view-close)
     */
    ipcMain.on('electron-browser-view-can-go-back', (_: any) => {
        if (!kcBrowserView.webContents)
            return;
        let response: IpcMessage = {
            error: undefined,
            success: {data: kcBrowserView.webContents.canGoBack()}
        }
        kcMainWindow.webContents.send('electron-browser-view-can-go-back-results', response);
    });

    ipcMain.on('electron-browser-view-can-go-forward', (_: any) => {
        if (!kcBrowserView.webContents)
            return;
        let response: IpcMessage = {
            error: undefined,
            success: {data: kcBrowserView.webContents.canGoForward()}
        }
        kcMainWindow.webContents.send('electron-browser-view-can-go-forward-results', response);
    });

    ipcMain.on('electron-browser-view-current-url', (_: any) => {
        if (!kcBrowserView.webContents)
            return;
        let response: IpcMessage = {
            error: undefined,
            success: {data: kcBrowserView.webContents.getURL()}
        }
        kcMainWindow.webContents.send('electron-browser-view-current-url-results', response);
    });

    ipcMain.on('electron-browser-view-go-back', (_: any) => {
        if (!kcBrowserView.webContents)
            return;
        if (kcBrowserView.webContents) {
            kcBrowserView.webContents.goBack();
        }
    });

    ipcMain.on('electron-browser-view-go-forward', (_: any) => {
        if (!kcBrowserView.webContents)
            return;
        if (kcBrowserView.webContents) {
            kcBrowserView.webContents.goForward();
        }
    });

    ipcMain.on('electron-browser-view-refresh', (_: any) => {
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
    const containsArgs = arg && arg.url && arg.x && arg.y && arg.height && arg.width
    const correctTypes = typeof (arg.url) === 'string'
        && typeof (arg.height) === 'number' && typeof (arg.x) === 'number'
        && typeof (arg.width) === 'number' && typeof (arg.y) === 'number';
    if (!containsArgs) console.warn('KsBrowserViewRequest does not contain the necessary fields.');
    if (!correctTypes) console.warn('KsBrowserViewRequest item types are invalid.');
    // TODO: Make sure these values are also within the bounds of the main window as an extra sanity check
    return containsArgs && correctTypes;
}


module.exports = {extractWebsite, closeBrowserView, openBrowserView, destroyBrowserViews}
