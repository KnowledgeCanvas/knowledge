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

import {IpcMessage, KcUuidRequest} from "../../../../kc_shared/models/electron.ipc.model";

const share: any = (global as any).share;
const ipcMain: any = share.ipcMain;
const http: any = share.http;
const uuid: any = share.uuid;

let generateUuid;

generateUuid = ipcMain.on("A2E:Uuid:Generate", (event: any, args: any) => {
    let kcMainWindow: any = share.BrowserWindow.getAllWindows()[0];
    let response: IpcMessage = {
        error: undefined,
        success: undefined
    }
    if (!isKcUuidRequest(args)) {
        const message = `electron-generate-uuid argument does not conform to KcUuidRequest`;
        response.error = {code: 412, label: http.STATUS_CODES['412'], message: message};
        console.warn(response.error);
        kcMainWindow.webContents.send('E2A:BrowserView:Open', response);
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
    kcMainWindow.webContents.send("E2A:Uuid:Generate", response);
});


function isKcUuidRequest(args: any): args is KcUuidRequest {
    const containsQuantity = args && args.quantity;
    const correctType = typeof (args.quantity) === 'number';
    const correctRange = 0 < args.quantity && args.quantity <= 128;
    return containsQuantity && correctType && correctRange;
}


module.exports = {generateUuid}
