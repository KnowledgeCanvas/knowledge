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
import {KcTheme} from "./style.model";


/**
 * All of these are set to default values inside the Electron Settings Service file under the `defaults()` function.
 */
export interface SettingsModel {
    env: EnvironmentSettingsModel;
    app: ApplicationSettingsModel;
    display: DisplaySettingsModel;
    docker: DockerSettingsModel;
    ingest: IngestSettingsModel;
    system: SystemSettingsModel;
    search: SearchSettingsModel;
    user: UserSettingsModel;
}

export interface DockerSettingsModel {
    enabled: boolean;
    dockerPath: string;
}

export interface UserSettingsModel {
    firstName: string;
    lastName: string;
    userName: string;
    birthdate: string;
}

export interface EnvironmentSettingsModel {
    appTitle: string;
    settingsFilename: string;
    DEFAULT_WINDOW_HEIGHT: number;
    DEFAULT_WINDOW_WIDTH: number;
    STARTUP_WINDOW_HEIGHT: number;
    STARTUP_WINDOW_WIDTH: number;
}

export interface SystemSettingsModel {
    appPath: string // Root storage location
    appVersion: string // Knowledge Canvas version
    cwd: string // The current working directory, dynamically set on App startup
    downloadPath: string // Default downloads location
    electronVersion: string // Current version of Electron, determined by process.versions.electron
    envPath: string // Location of `.env` file TODO: could this be set to process.resourcesPath?
    firstRun: boolean // Set to true if this is the first time the app is run, otherwise false, used for lifecycle
    homePath: string // Depends on OS, equivalent to `~/` in Linux/MacOS
    nodeVersion: string // Current version of node, determined by process.versions.node
    osPlatform: string // Current platform as determined by process.platform
    osVersion: string // Current platform version, set to process.getSystemVersion()
    pathSep: string // Set to "/" for Linux and MacOS, set to "\" for Windows using `path.sep`
    resourcesPath: string // Location of the Resources directory, copied into the final build but must be computed dynamically
    settingsPath: string // Location of the directory containing the settings file
    settingsFilePath: string // Fully qualified path to the JSON settings file
}

export interface ApplicationSettingsModel {
    table: TableSettingsModel
    grid: GridSettingsModel
    calendar: CalendarSettingsModel
}

export interface TableSettingsModel {
    showSubProjects: boolean
    showCountdown: boolean
}

export interface GridSettingsModel {
    size: CardSizeType
    sorter: CardSortType
}

export type CardSizeType = 'auto' | 'xs' | 'sm' | 'md' | 'lg';
export type CardSortType = 'title-a' | 'title-d' | 'created-a' | 'created-d' | 'type-a' | 'type-d'
export type CardOptions = {
    showThumbnail: boolean,
    showDescription: boolean,
    showProjectSelection: boolean,
    showTopics: boolean,
    showIcon: boolean,
    showRemove: boolean,
    showPreview: boolean,
    showEdit: boolean,
    showOpen: boolean,
    showContentType: boolean,
    showProjectName: boolean
}

export interface CalendarSettingsModel {
    
}

export interface SearchSettingsModel {
    provider: 'google' | 'bing' | 'duck'
}

export interface DisplaySettingsModel {
    theme: KcTheme
    logging: LoggingSettingsModel
}

export interface LoggingSettingsModel {
    warn: boolean
    error: boolean
    debug: boolean
}

export interface IngestSettingsModel {
    manager: FileManagerSettingsModel
    extensions: ExtensionServerSettingsModel
    autoscan: AutoscanSettingsModel
}

export interface ExtensionServerSettingsModel {
    enabled: boolean,
    port: number,
    path: string
}

export interface AutoscanSettingsModel {
    enabled: boolean,
    path: string,
    interval: number,
}

export interface FileManagerSettingsModel {
    enabled: boolean,
    storageLocation: string,
    target: 'autoscan' | 'all'
}
