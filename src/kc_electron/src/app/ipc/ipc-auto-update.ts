import {IpcResponse} from "../models/electron.ipc.model";

const share: any = (global as any).share;
const ipcMain: any = share.ipcMain;
const autoUpdater: any = share.autoUpdater;

let checkForUpdate = ipcMain.on('electron-check-for-update', (event: any) => {
    // let kcMainWindow: any = share.BrowserWindow.getAllWindows()[0];
    // let message: IpcResponse = {
    //     error: undefined,
    //     success: {
    //         data: 'Beginning update check...'
    //     }
    // }
    // kcMainWindow.webContents.send('electron-auto-update', message);

    autoUpdater.checkForUpdates().then((result: any) => {
        // console.warn('result from check for update: ', result);
    }).catch((error: any) => {
        // console.warn('error from check for update: ', error);
    });
});

let getCurrentVersion = ipcMain.on('electron-auto-update-current-version', (event: any) => {
    let kcMainWindow: any = share.BrowserWindow.getAllWindows()[0];

    let message: IpcResponse = {
        error: undefined,
        success: {
            data: autoUpdater.currentVersion.version
        }
    }
    kcMainWindow.webContents.send('electron-auto-update-current-version-results', message);
});

module.exports = {
    checkForUpdate, getCurrentVersion
}
