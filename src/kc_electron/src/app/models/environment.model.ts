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

export interface EnvironmentModel {
    DEFAULT_WINDOW_HEIGHT?: number;
    DEFAULT_WINDOW_WIDTH?: number;
    STARTUP_WINDOW_HEIGHT?: number;
    STARTUP_WINDOW_WIDTH?: number;
    appPath: string;
    appTitle: string;
    cwd: string;
    display: any;
    dockerDirectoryPath?: string;
    envPath?: string;
    error?: string;
    filesPath?: string;
    firstRun: boolean;
    homeDir?: string;
    ingest?: any;
    pathSep: string;
    pdfPath: string;
    projectsPath: string;
    search?: any;
    serverPath: string;
    settingsFilePath: string;
    settingsFilename: string;
    settingsPath: string;
    wellness?: any;
    app?: any;
}
