import { KcTheme } from "./style.model";
export interface SettingsModel {
    app?: ApplicationSettingsModel;
    appPath?: string;
    display?: DisplaySettingsModel;
    firstRun?: boolean;
    googleApiKey?: string;
    ingest?: IngestSettingsModel;
    pathSep?: string;
    projectsPath?: string;
    search?: SearchSettingsModel;
    userName?: string;
}
export interface ApplicationSettingsModel {
    ks?: {
        table?: {
            expandRows?: boolean;
            showSubProjects?: boolean;
            hideSidebar?: boolean;
            showCountdown?: boolean;
        };
    };
}
export interface SearchSettingsModel {
    numResults?: number;
    provider?: string;
}
export interface DisplaySettingsModel {
    theme: KcTheme;
}
export interface IngestSettingsModel {
    autoscan?: boolean;
    autoscanLocation?: string;
    interval?: number;
    managed?: boolean;
    preserveTimestamps?: string;
    storageLocation?: string;
    extensions?: {
        httpServerEnabled?: boolean;
        httpServerPort?: number;
    };
}
