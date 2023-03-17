/*
 * Copyright (c) 2023 Rob Royce
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import {IpcMessage} from "../../../../kc_shared/models/electron.ipc.model";
import {BrowserWindow} from "electron";
import {KcProject} from "kc_angular/src/app/models/project.model";

const share = (global as any).share;
const storageService = share.storageService;

class MigrationService {
    constructor() {
    }

    async migrate(updateStatus: (message: string) => void, startupWindow: BrowserWindow) {
        // TODO: change the subpath once this is complete
        let migrationVersion: IpcMessage = await storageService.getStorage({
            key: 'migration-version',
            subpath: ['deleteme']
        });
        console.log('Migration version: ', migrationVersion);

        // If migration version does not exist, assume user is still using previous storage solution (localStorage)
        if (migrationVersion.error || !migrationVersion.success?.data || Object.keys(migrationVersion.success.data).length === 0) {
            updateStatus('Migrating Storage')
            await new Promise(r => setTimeout(r, 1000));
            await this.migrateLocalStorage(updateStatus, startupWindow);
            await new Promise(r => setTimeout(r, 1000));
            // Update migration version to 0.7.1
            // TODO: set subpath correctly
            await storageService.setStorage({key: 'migration-version', data: '0.8.0', subpath: ['deleteme']});
        }
    }

    async migrateLocalStorage(updateStatus: (message: string) => void, startupWindow: BrowserWindow) {
        // Get local storage
        // Copy project IDs
        // Copy projects
        // Copy Sources

        console.log('Migrating storage...');

        const projectIdsStr = await startupWindow.webContents.executeJavaScript('localStorage.getItem("kc-projects");', true);
        if (projectIdsStr) {
            console.log('Got project ids: ', projectIdsStr);
            let projectIds: string[] = JSON.parse(projectIdsStr);

            await new Promise(r => setTimeout(r, 1000));

            let i = 1;
            for (let projectId of projectIds) {
                updateStatus(`Migrating Projects (${i++}/${projectIds.length})`)

                const projectStr = await startupWindow.webContents.executeJavaScript(`localStorage.getItem("${projectId}");`, true);
                if (projectStr) {
                    let project: KcProject = JSON.parse(projectStr);
                    for (let ks of project.knowledgeSource) {
                        ks.icon = undefined;

                        // TODO: decide if we want to erase all icons and start over...
                        // ks.icon = await startupWindow.webContents.executeJavaScript(`localStorage.getItem("icon-${ks.id.value}");`, true);

                        // if (ks.icon.length > 1024) {
                        //     ks.icon = null;
                        // }
                        // if (ks.thumbnail && ks.thumbnail.length > 4096) {
                        //     ks.thumbnail = undefined
                        // }

                        await storageService.setStorage({key: ks.id.value, data: ks, subpath: ['sources']});

                        // Ensure that the project follows the updated schema
                        if (!project.sources) {
                            project.sources = [];
                        }

                        // Make sure that any/all sources make it into the appropriate list (sources)
                        if (!project.sources.map(i => i.value).includes(ks.id.value)) {
                            project.sources.push(ks.id);
                        }
                    }

                    // This field is being deprecated as of 0.8.0 and replaced with `sources`
                    // project.knowledgeSource = [];
                    await storageService.setStorage({key: projectId, data: project, subpath: ['projects']});
                }
                // await new Promise(r => setTimeout(r, 1));
            }
            await storageService.setStorage({key: 'projects', data: projectIdsStr, subpath: ['projects']});
        }
    }
}

const migrationService = new MigrationService();
module.exports = migrationService;
