export interface SettingsModel {
  firstRun?: boolean;
  pathSep?: string;
  appPath?: string;
  projectsPath?: string;
  googleApiKey?: string;
  userName?: string;
  search?: SearchSettingsModel
  ingest?: IngestSettingsModel
}

export interface SearchSettingsModel {
  numResults?: number
}

export interface IngestSettingsModel {
  autoscan: boolean;
  autoscanLocation?: string;
  managed: boolean;
}
