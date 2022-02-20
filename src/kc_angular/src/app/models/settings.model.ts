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
import {KcTheme} from "../services/user-services/theme-service/theme.service";

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
  wellness?: WellnessSettingsModel;
}

export interface ApplicationSettingsModel {
  ks?: {
    table?: {
      expandRows?: boolean;
      showSubProjects?: boolean;
      hideSidebar?: boolean;
      showCountdown?: boolean;
    }
  }
}

export interface SearchSettingsModel {
  numResults?: number,
  provider?: string
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
}

export interface StorageSettingsModel {

}

export interface WellnessSettingsModel {
  allowOverride: boolean;
  autostartAfterBreak: boolean;
  breakMinutes: number;
  breakSeconds: number;
  timerMinutes: number;
  timerSeconds: number;
}
