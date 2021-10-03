/**
 Copyright 2021 Rob Royce

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

import {IpcMessage} from "../models/electron.ipc.model";

let share: any = (global as any).share;
let http: any = share.http;
let url: any = share.url;

let createServer = () => {
    http.createServer((req: any, res: any) => {
        // TODO: try to figure out which browsers the user has available for later use

        console.log('--------------------------------------------------------------------------------');
        console.log('Browser Extension Server - Link Received')
        console.log('Request: ', url.parse(req.url, true).query);
        console.log('--------------------------------------------------------------------------------');

        let kcMainWindow: any = share.BrowserWindow.getAllWindows()[0];
        let q = url.parse(req.url, true).query;

        // console.log('Request: ', req);
        // console.log('Meta: ', req.body);

        if (q.link) {
            let ipcResponse: IpcMessage = {
                error: undefined,
                success: {data: q.link}
            }
            kcMainWindow.webContents.send('app-chrome-extension-results', ipcResponse);
            res.end("Done");
        } else {
            console.error('Received invalid link from Chrome extension...');
            res.end('Failed');
        }
    }).listen(9000)
}

module.exports = {
    createServer
}




