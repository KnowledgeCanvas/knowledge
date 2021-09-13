const share: any = (global as any).share;
const ipcMain = share.ipcMain;
const autoUpdater = share.autoUpdater;

import {IpcMessage} from "../models/electron.ipc.model";

let checkForUpdate = ipcMain.on('electron-check-for-update', (_: any) => {
    autoUpdater.checkForUpdates().then((result: any) => {
        console.warn('Result from check for update: ', result);
    }).catch((error: any) => {
        console.warn('Error from check for update: ', error);
    });
});

let getCurrentVersion = ipcMain.on('app-get-current-version', (_: any) => {
    let kcMainWindow: any = share.BrowserWindow.getAllWindows()[0];
    let message: IpcMessage = {
        error: undefined,
        success: {
            data: autoUpdater.currentVersion.version
        }
    }
    kcMainWindow.webContents.send('app-get-current-version-results', message);
});


module.exports = {
    checkForUpdate, getCurrentVersion
}
