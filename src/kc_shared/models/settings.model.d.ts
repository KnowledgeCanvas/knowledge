import { KcTheme } from "./style.model";
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
    appPath: string;
    appVersion: string;
    cwd: string;
    downloadPath: string;
    electronVersion: string;
    envPath: string;
    firstRun: boolean;
    homePath: string;
    nodeVersion: string;
    osPlatform: string;
    osVersion: string;
    pathSep: string;
    resourcesPath: string;
    settingsPath: string;
    settingsFilePath: string;
}
export interface ApplicationSettingsModel {
    table: TableSettingsModel;
    grid: GridSettingsModel;
    calendar: CalendarSettingsModel;
}
export interface TableSettingsModel {
    showSubProjects: boolean;
    showCountdown: boolean;
}
export interface GridSettingsModel {
    size: CardSizeType;
    sorter: CardSortType;
}
export declare type CardSizeType = 'auto' | 'xs' | 'sm' | 'md' | 'lg';
export declare type CardSortType = 'title-a' | 'title-d' | 'created-a' | 'created-d' | 'type-a' | 'type-d';
export declare type CardOptions = {
    showThumbnail: boolean;
    showDescription: boolean;
    showProjectSelection: boolean;
    showTopics: boolean;
    showIcon: boolean;
    showRemove: boolean;
    showPreview: boolean;
    showEdit: boolean;
    showOpen: boolean;
    showContentType: boolean;
    showProjectName: boolean;
};
export interface CalendarSettingsModel {
}
export interface SearchSettingsModel {
    provider: 'google' | 'bing' | 'duck';
}
export interface DisplaySettingsModel {
    theme: KcTheme;
    logging: LoggingSettingsModel;
}
export interface LoggingSettingsModel {
    warn: boolean;
    error: boolean;
    debug: boolean;
}
export interface IngestSettingsModel {
    manager: FileManagerSettingsModel;
    extensions: ExtensionServerSettingsModel;
    autoscan: AutoscanSettingsModel;
}
export interface ExtensionServerSettingsModel {
    enabled: boolean;
    port: number;
    path: string;
}
export interface AutoscanSettingsModel {
    enabled: boolean;
    path: string;
    interval: number;
}
export interface FileManagerSettingsModel {
    enabled: boolean;
    storageLocation: string;
    target: 'autoscan' | 'all';
}
