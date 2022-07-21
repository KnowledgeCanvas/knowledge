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
import * as http from "http";
import {IncomingMessage, ServerResponse} from "http";
import {IngestSettingsModel, SettingsModel} from "../../../../kc_shared/models/settings.model";
import {IpcMessage} from "../../../../kc_shared/models/electron.ipc.model";
import {Buffer} from "buffer";

let share: any = (global as any).share;
let url: any = share.url;

const settings = require('./settings.service');

class ExtensionServer {
    private __server?: http.Server;
    private __PORT = 9000;

    constructor() {
        settings.all.subscribe((settings: SettingsModel) => {
            if (!settings.ingest) {
                console.warn('Ingeset settings not found in retrieved settings model...');
                return;
            }

            if (settings.ingest.extensions.port && settings.ingest.extensions.port !== this.__PORT) {
                this.stop();
                this.__PORT = settings.ingest.extensions.port;
            }

            if (settings.ingest.extensions.enabled) {
                this.start(settings.ingest);
            } else {
                this.stop();
            }
        });
    }

    async receive(req: IncomingMessage, res: ServerResponse) {
        console.debug('Browser Extension Server - Message Received - ', req.url)
        const buffers = [];
        for await (const chunk of req) {
            buffers.push(chunk);
        }
        const data = Buffer.concat(buffers).toString();
        const kcMainWindow: any = share.BrowserWindow.getAllWindows()[0];
        const ks = JSON.parse(data);
        console.log('Received KS: ', ks);

        if (ks.accessLink) {
            let ipcResponse: IpcMessage = {
                error: undefined,
                success: {data: ks}
            }
            kcMainWindow.webContents.send('E2A:Extension:Import', ipcResponse);
            res.end('Done');
        } else {
            console.error('Received invalid link from Chrome extension...');
            res.end('Failed');
        }
    }

    start(ingest: IngestSettingsModel) {
        if (this.__server?.listening) {
            return;
        }

        if (this.__server) {
            console.warn('Server was already running...');
            this.__server.close();
        }

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

        console.debug('Extensions - Starting server on port ', this.__PORT);
        this.__server?.listen(this.__PORT);
    }

    stop() {
        if (this.__server) {
            console.debug('Extensions - Stopping server...');
            this.__server.close();
            this.__server = undefined;
        }
    }
}

const extensionService = new ExtensionServer();
module.exports = {
    extensions: extensionService
}
