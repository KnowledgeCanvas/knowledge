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
import {Component, OnInit} from '@angular/core';
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {ThemeService} from "../../../services/user-services/theme.service";
import {SettingsService} from "../../../services/ipc-services/settings.service";
import {NotificationsService} from "../../../services/user-services/notifications.service";
import {KcTheme} from "../../../../../../kc_shared/models/style.model";
import {DisplaySettingsModel} from "../../../../../../kc_shared/models/settings.model";

@Component({
  selector: 'app-display-settings',
  templateUrl: './display-settings.component.html',
  styleUrls: ['./display-settings.component.scss']
})
export class DisplaySettingsComponent implements OnInit {
  displaySettings?: DisplaySettingsModel;
  themes: KcTheme[];
  selectedTheme?: KcTheme;
  logLevels = [
    {name: 'Error', value: 'error'},
    {name: 'Warn', value: 'warn'},
    {name: 'Debug', value: 'debug'}
  ];
  logLevel: string[] = [];

  constructor(private ref: DynamicDialogRef, private config: DynamicDialogConfig,
              private themeService: ThemeService, private settingsService: SettingsService,
              private notificationsService: NotificationsService) {
    const displaySettings = settingsService.get().display;
    this.displaySettings = displaySettings;
    this.themes = themeService.groupedThemes;
    this.selectedTheme = themeService.currentTheme;

    if (displaySettings) {
      if (displaySettings.logging.debug) {
        this.logLevel.push('debug');
      }
      if (displaySettings.logging.error) {
        this.logLevel.push('error');
      }
      if (displaySettings.logging.warn) {
        this.logLevel.push('warn');
      }
    }
  }

  ngOnInit(): void {

  }

  onThemeChange($event: any) {
    if (!$event.value) {
      return;
    }

    const theme: KcTheme = $event.value;

    const prev = this.themeService.currentTheme;

    this.themeService.switchTheme(theme.code).then((res) => {
      if (!res) {
        this.selectedTheme = prev;
        this.themeService.switchTheme(prev.code);
        this.notificationsService.warn('DisplaySettings', 'Theme Unavailable', theme.name);
      } else {
        this.settingsService.set({display: {theme: this.themeService.currentTheme}});
      }
    })
  }

  restoreDefaultTheme() {
    if (this.selectedTheme?.code === this.themeService.defaultTheme.code) {
      return;
    }

    this.themeService.switchTheme(this.themeService.defaultTheme.code).then((res) => {
      console.debug('DisplaySettings: set theme to default: ', res);
      this.settingsService.set({display: {theme: this.themeService.currentTheme}});
    })
    this.selectedTheme = this.themeService.restoreDefault();
  }

  onLoggingChange($event: any) {
    let values: string[] = $event.value;
    if (!values) {
      return;
    }

    let logging = {
      warn: false,
      debug: false,
      error: false
    }

    if (values.includes('warn')) {
      if (!this.displaySettings?.logging.warn) {
        this.notificationsService.warn('DisplaySettings', 'Warnings Enabled', 'This is a sample warning message.', 'toast');
      }
      logging.warn = true;
    }

    if (values.includes('error')) {
      if (!this.displaySettings?.logging.error) {
        this.notificationsService.error('DisplaySettings', 'Errors Enabled', 'This is a sample error message.', 'toast');
      }
      logging.error = true;
    }

    if (values.includes('debug')) {
      if (!this.displaySettings?.logging.debug) {
        this.notificationsService.debug('DisplaySettings', 'Debug Enabled', 'This is a sample debug message.', 'toast');
      }
      logging.debug = true;
    }

    if (this.displaySettings) {
      this.displaySettings.logging = logging;
      this.settingsService.set({display: this.displaySettings});
    }
  }
}
