export interface SettingsModel {
  firstRun?: boolean;
  pathSep?: string;
  appPath?: string;
  projectsPath?: string;
  googleApiKey?: string;
  userName?: string;
  search?: SearchSettingsModel
  ingest?: IngestSettingsModel,
  wellness?: WellnessSettingsModel
}

export interface SearchSettingsModel {
  numResults?: number
}

export interface IngestSettingsModel {
  autoscan: boolean;
  interval?: number;
  autoscanLocation?: string;
  preserveTimestamps?: string;
  managed: boolean;
}

export interface WellnessSettingsModel {
  autostartAfterBreak: boolean;
  allowOverride: boolean;
  timerMinutes: number;
  timerSeconds: number;
  breakMinutes: number;
  breakSeconds: number;
}
