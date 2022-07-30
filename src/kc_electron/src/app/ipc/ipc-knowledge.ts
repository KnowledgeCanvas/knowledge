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
const ipcMain = share.ipcMain;
const app = share.app;
const path = share.path;
const BrowserWindow = share.BrowserWindow;

const KNOWLEDGE_ENTRY: string = path.join(app.getAppPath(), 'src', 'kc_knowledge', 'src', 'knowledge-graph.html');

let kcKnowledgeWindow: typeof BrowserWindow | null;

let ipcHandshake = (ksList: []): Promise<any> => {
    console.log('Starting IPC Handshake with modal window...');
    let kcMainWindow: typeof BrowserWindow = BrowserWindow.getAllWindows()[0];
    return new Promise<any>((resolve) => {
        ipcMain.once('A2E:KnowledgeCanvas:GetSources', (_: any) => {
            console.log('Sending back ksList to Knowledge Canvas modal...');
            kcMainWindow.webContents.send('E2A:KnowledgeCanvas:GetSources', ksList);
            resolve(ksList);
        });
    });
}

let getKnowledgeSourceList = ipcMain.on('A2E:KnowledgeCanvas:Open', (_: any, args: any) => {
    console.debug('Getting knowledge source list for KC...');

    let kcMainWindow: typeof BrowserWindow = BrowserWindow.getAllWindows()[0];
    let size = kcMainWindow.getSize();
    const width = size[0];
    const height = size[1];
    const config = {
        show: false,
        width: width,
        height: height,
        modal: true,
        backgroundColor: '#FFF',
        title: 'Knowledge',
        parent: kcMainWindow,
        webPreferences: {
            nodeIntegration: false, // is default value after Electron v5
            contextIsolation: true, // protect against prototype pollution
            enableRemoteModule: false, // turn off remote
            preload: path.join(app.getAppPath(), 'src', 'kc_electron', 'dist', 'preload.js')
        }
    };

    // Declare window used to display knowledge graphs, etc
    kcKnowledgeWindow = new BrowserWindow(config);

    // Destroy window on close
    kcKnowledgeWindow.on('closed', function () {
        kcKnowledgeWindow = null;
    });

    kcKnowledgeWindow.once('ready-to-show', () => {
        if (kcKnowledgeWindow) {
            kcKnowledgeWindow.show();
            ipcHandshake(args).then((response) => {
                console.log('Got response from handshake: ', response);
            })
        }
    });

    ipcMain.on('A2E:KnowledgeCanvas:Close', (_: any) => {
        console.log('Close modal signal received...');
        if (kcKnowledgeWindow)
            kcKnowledgeWindow.close();
        kcKnowledgeWindow = null;
    });

    console.log('Loading "Knowledge Entry"...');
    kcKnowledgeWindow.loadFile(KNOWLEDGE_ENTRY);
});

module.exports = {
    getKnowledgeSourceList
}
