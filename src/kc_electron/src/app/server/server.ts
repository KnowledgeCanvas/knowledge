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

import {IpcMessage} from "../models/electron.ipc.model";
import * as http from "http";

let share: any = (global as any).share;
let url: any = share.url;

export class KcExtensionServer {
    private __server?: http.Server;
    private __PORT = 9000;

    constructor() {
        this.__server = http.createServer(this.receive);
        this.__server.on('error', (e) => {
            console.error('ExtensionServer Error: ', e);

            if ((e as any).code && (e as any).code === 'EADDRINUSE') {
                console.debug('Port in use, retrying...');
                setTimeout(() => {
                    if (!this.__server) {
                        return;
                    }
                    this.__server.close();
                    this.__server.listen(this.__PORT);
                }, 10000);
            }
        });
    }

    async receive(req: any, res: any) {
        console.debug('--------------------------------------------------------------------------------');
        console.debug('Browser Extension Server - Link Received')
        console.debug('Request: ', url.parse(req.url, true).query);
        console.debug('--------------------------------------------------------------------------------');

        let kcMainWindow: any = share.BrowserWindow.getAllWindows()[0];
        let q = url.parse(req.url, true).query;

        if (q.link) {
            let ipcResponse: IpcMessage = {
                error: undefined,
                success: {data: q.link}
            }
            kcMainWindow.webContents.send('E2A:Extension:Import', ipcResponse);
            res.end("Done");
        } else {
            console.error('Received invalid link from Chrome extension...');
            res.end('Failed');
        }
    }

    start() {
        if (!this.__server) {
            return;
        }
        this.__server?.listen(this.__PORT);
    }
}

let kcExtensionServer = new KcExtensionServer();

module.exports = {
    kcExtensionServer
}




