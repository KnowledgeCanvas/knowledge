import {IpcResponse, KsThumbnailRequest, PromptForDirectoryRequest} from "../models/electron.ipc.model";

const share: any = (global as any).share;
const ipcMain: any = share.ipcMain;
const dialog: any = share.dialog;
const http: any = share.http;
const shell: any = share.shell;
const path: any = share.path;
const nativeImage: any = share.nativeImage;
const app: any = share.app;

let promptForDirectory, openLocalFile, getFileThumbnail, getFileIcon;
module.exports = {promptForDirectory, openLocalFile, getFileThumbnail, getFileIcon}


/**
 * promptForDirectory
 * @param request: [PromptForDirectoryRequest] configuration for dialog.showOpenDialogSync
 * @return path: [string] the path selected by user
 * @callback app-prompt-for-directory-results
 * @description opens a file chooser dialog that allows the user to select a path
 */
promptForDirectory = ipcMain.on('app-prompt-for-directory', (event: any, request: PromptForDirectoryRequest) => {
    if (!request) {
        request = {properties: ['openDirectory', "createDirectory"]}
    }
    let kcMainWindow: any = share.BrowserWindow.getAllWindows()[0];
    const result = dialog.showOpenDialogSync(kcMainWindow, request);
    let response: IpcResponse = {
        error: undefined,
        success: undefined
    }
    if (result && result[0]) {
        let dir = result[0];
        response.success = {data: dir}
    } else {
        response.error = {
            code: 412,
            label: http.STATUS_CODES['412'],
            message: 'Invalid or non-existent path or directory chosen.'
        }
    }
    kcMainWindow.webContents.send('app-prompt-for-directory-results', response);
})


/**
 * openLocalFile
 * @param filePath: [string] path of file to open
 * @return none
 * @callback electron-open-local-file-results [boolean]
 * @description opens the file located at filePath in the OS-level default application
 */
openLocalFile = ipcMain.on('electron-open-local-file', (event: any, filePath: string) => {
    shell.openPath(path.resolve(filePath)).then((outcome: string) => {
        let response: IpcResponse = {error: undefined, success: undefined}
        if (outcome === '') {
            response.success = {data: true}
        } else {
            response.error = {
                message: outcome,
                code: 501,
                label: http.STATUS_CODES['501']
            }
        }
        let kcMainWindow: any = share.BrowserWindow.getAllWindows()[0];
        kcMainWindow.webContents.send('electron-open-local-file-results', response);
    });
});


/**
 * getFileThumbnail
 * @param requests: [KsThumbnailRequest[]] an array of thumbnail requests
 * @return thumbnails: [nativeImage[]] an array of thumbnails
 * @callback electron-get-file-thumbnail-results [IpcResponse[]]
 * @description requests thumbnails for files in each request and returns them in an array
 */
getFileThumbnail = ipcMain.on('electron-get-file-thumbnail', (event: any, requests: KsThumbnailRequest[]) => {
    let kcMainWindow: any = share.BrowserWindow.getAllWindows()[0];
    let responses: IpcResponse[] = [];
    let actions: any[] = [];

    if (requests.length <= 0) {
        responses = [{
            error: {code: 412, label: http.STATUS_CODES['412'], message: 'Invalid thumbnail request.'},
            success: undefined
        }]
        let kcMainWindow: any = share.BrowserWindow.getAllWindows()[0];
        kcMainWindow.webContents.send('electron-get-file-thumbnail-results', responses);
        return;
    }

    for (let request of requests) {
        if (request.height && request.width)
            actions.push(nativeImage.createThumbnailFromPath(path.resolve(request.path), {
                width: request.width,
                height: request.height
            }));
        else
            actions.push(nativeImage.createThumbnailFromPath(path.resolve(request.path), {width: 800, height: 1600}));
    }


    Promise.all(actions).then((thumbnails) => {
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
        let response: IpcResponse = {
            error: {
                code: 501,
                label: http.STATUS_CODES['501'],
                message: 'OS failed to generate thumbnails'
            },
            success: undefined
        }
        // The caller is expecting an array, so even though we're only sending a single response, we wrap it in array
        kcMainWindow.webContents.send('electron-get-file-thumbnail-results', [response]);
    });
});

/**
 * getFileIcon
 * @param filePaths: [string] an array of file paths for which to get the icons
 * @return thumbnails: [nativeImage[]] an array of icons
 * @callback electron-get-file-icon-results [IpcResponse[]]
 * @description requests icons for files in each request and returns them in an array
 */
getFileIcon = ipcMain.on('electron-get-file-icon', (event: any, filePaths: string[]) => {
    if (filePaths.length <= 0) {
        return;
    }
    let kcMainWindow: any = share.BrowserWindow.getAllWindows()[0];
    let responses: IpcResponse[] = [];
    let options = {size: 'normal'}
    let actions: any[] = [];
    for (let filePath of filePaths) {
        actions.push(app.getFileIcon(path.resolve(filePath), options));
    }
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
