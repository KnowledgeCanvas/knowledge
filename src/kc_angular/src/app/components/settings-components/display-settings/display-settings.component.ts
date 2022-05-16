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
import {ThemeService} from "../../../services/user-services/theme-service/theme.service";
import {SettingsService} from "../../../services/ipc-services/settings-service/settings.service";
import {NotificationsService} from "../../../services/user-services/notification-service/notifications.service";
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

  constructor(private ref: DynamicDialogRef, private config: DynamicDialogConfig,
              private themeService: ThemeService, private settingsService: SettingsService,
              private notificationsService: NotificationsService) {
    this.displaySettings = settingsService.getSettings().display;
    this.themes = themeService.groupedThemes;
    this.selectedTheme = themeService.currentTheme;
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
        this.notificationsService.toast({
          severity: 'warn',
          summary: 'Oops!',
          detail: `Sorry, but it seems like the theme "${theme.name}" is unavailable.`,
          life: 5000
        });
      } else {
        this.settingsService.saveSettings({display: {theme: this.themeService.currentTheme}});
      }
    })
  }

  restoreDefaultTheme() {
    if (this.selectedTheme?.code === this.themeService.defaultTheme.code) {
      return;
    }

    this.themeService.switchTheme(this.themeService.defaultTheme.code).then((res) => {
      console.debug('DisplaySettings: set theme to default: ', res);
      this.settingsService.saveSettings({display: {theme: this.themeService.currentTheme}});
    })
    this.selectedTheme = this.themeService.restoreDefault();
  }
}
