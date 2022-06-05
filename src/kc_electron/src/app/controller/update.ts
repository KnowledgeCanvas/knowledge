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

const share: any = (global as any).share;
const http: any = share.http;
const autoUpdater = share.autoUpdater;

import {IpcMessage} from "../../../../kc_shared/models/electron.ipc.model";

console.log(`AutoUpdate - Knowledge Canvas Version ${autoUpdater.currentVersion.version} - Initializing...`);

autoUpdater.on('checking-for-update', () => {
    let message: IpcMessage = {
        error: undefined,
        success: {
            data: 'Auto updater checking for update...'
        }
    }
    console.log(message);
});

autoUpdater.on('update-available', (info: any) => {
    let message: IpcMessage = {
        error: undefined,
        success: {
            data: info,
            message: 'Auto updater found new update...'
        }
    }
    console.log(message);
});

autoUpdater.on('update-not-available', (info: any) => {
    let message: IpcMessage = {
        error: undefined,
        success: {
            data: info,
            message: 'No updates available...'
        }
    }
    console.log(message);
});

autoUpdater.on('error', (err: any) => {
    let message: IpcMessage = {
        error: {
            code: 501,
            label: http.STATUS_CODES['501'],
            message: err
        },
        success: undefined
    }
    console.log(message);
});

autoUpdater.on('download-progress', (progressObj: any) => {
    let log_message = "Download speed: " + progressObj.bytesPerSecond;
    log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
    log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
    let message: IpcMessage = {
        error: undefined,
        success: {
            message: log_message
        }
    }
    console.log(message);
});

autoUpdater.on('update-downloaded', (info: any) => {
    let message: IpcMessage = {
        error: undefined,
        success: {
            data: info,
            message: 'Update finished downloading...'
        }
    }
    console.log(message);
});
