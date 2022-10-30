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

let share: any = (global as any).share;

class WindowService {
    constructor() {
        share.ipcMain.on('A2E:Window:Minimize', (_: any) => {
            // TODO: this method of finding the main window is definitely broken...
            //      there is no gaurantee that the main window will be first in this array when a second window is open...
            //      this is preventing us from opening the Knowledge Graph in its own window
            const kcMainWindow = share.BrowserWindow.getAllWindows()[0];
            if (kcMainWindow) {
                kcMainWindow.minimize();
            } else {
                console.log('Unable to get main window...');
            }
        });

        share.ipcMain.on('A2E:Window:Maximize', (_: any) => {
            const kcMainWindow = share.BrowserWindow.getAllWindows()[0];
            if (kcMainWindow) {
                kcMainWindow.fullScreen = !kcMainWindow.fullScreen;
            } else {
                console.log('Unable to get main window...');
            }
        });

        share.ipcMain.on('A2E:Window:ZoomIn', (_: any, zoomLevel: number) => {
            const kcMainWindow = share.BrowserWindow.getAllWindows()[0];
            if (kcMainWindow) {
                kcMainWindow.webContents.setZoomFactor(zoomLevel / 100);
            } else {
                console.log('Unable to get main window...');
            }
        });

        share.ipcMain.on('A2E:Window:ZoomOut', (_: any, zoomLevel: number) => {
            const kcMainWindow = share.BrowserWindow.getAllWindows()[0];
            if (kcMainWindow) {
                kcMainWindow.webContents.setZoomFactor(zoomLevel / 100);
            } else {
                console.log('Unable to get main window...');
            }
        });
    }
}

const electronWindowService = new WindowService();
module.exports = electronWindowService
