/**
 Copyright 2021 Rob Royce

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

export interface SettingsModel {
  display?: DisplaySettingsModel;
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
  numResults?: number,
  provider?: string
}

export interface DisplaySettingsModel {
  theme: 'app-theme-dark' | 'app-theme-light';
}

export interface IngestSettingsModel {
  autoscan: boolean;
  interval?: number;
  autoscanLocation?: string;
  preserveTimestamps?: string;
  managed: boolean;
}

export interface StorageSettingsModel {

}

export interface WellnessSettingsModel {
  autostartAfterBreak: boolean;
  allowOverride: boolean;
  timerMinutes: number;
  timerSeconds: number;
  breakMinutes: number;
  breakSeconds: number;
}
