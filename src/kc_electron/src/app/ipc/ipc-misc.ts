import {IpcResponse, KcUuidRequest} from "../models/electron.ipc.model";
import {EnvironmentModel} from "../models/environment.model";

const share: any = (global as any).share;
const ipcMain: any = share.ipcMain;
const http: any = share.http;
const settingsService: any = share.settingsService;
const uuid: any = share.uuid;

let generateUuid, getSettings, setSettings;
module.exports = {generateUuid, getSettings, setSettings}


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
generateUuid = ipcMain.on("app-generate-uuid", (event: any, args: any) => {
    let kcMainWindow: any = share.BrowserWindow.getAllWindows()[0];
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
getSettings = ipcMain.on("app-get-settings", (event: any, args: object) => {
    let kcMainWindow: any = share.BrowserWindow.getAllWindows()[0];
    let appEnv = settingsService.getSettings();

    kcMainWindow.webContents.send("app-get-settings-results", appEnv);
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
setSettings = ipcMain.on("app-save-settings", (event: any, args: any) => {
    let kcMainWindow: any = share.BrowserWindow.getAllWindows()[0];
    let appEnv = settingsService.getSettings();
    appEnv = {...appEnv, ...args};
    settingsService.setSettings(appEnv).then((settings: EnvironmentModel) => {
        appEnv = settings;
    });
    kcMainWindow.webContents.send("app-save-settings-results", appEnv);
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
function isKcUuidRequest(args: any): args is KcUuidRequest {
    const containsQuantity = args && args.quantity;
    const correctType = typeof (args.quantity) === 'number';
    const correctRange = 0 < args.quantity && args.quantity <= 128;
    return containsQuantity && correctType && correctRange;
}
