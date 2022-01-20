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

import {Component, OnInit} from '@angular/core';
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {DisplaySettingsModel} from "../../../../../ks-lib/src/lib/models/settings.model";
import {KcTheme, ThemeService} from "../../services/theme/theme.service";
import {SettingsService} from "../../../../../ks-lib/src/lib/services/settings/settings.service";
import {Message, MessageService} from "primeng/api";

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
              private messageService: MessageService) {
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

        let msg: Message = {
          key: 'app-toasts',
          severity: 'warn',
          summary: 'Oops!',
          detail: `Sorry, but it seems like the theme "${theme.name}" is unavailable.`,
          life: 5000
        }
        this.messageService.add(msg);
      } else {
        this.settingsService.saveSettings({display: {theme: this.themeService.currentTheme}});
      }
    })
  }

  restoreDefaultTheme() {
    this.selectedTheme = this.themeService.restoreDefault();
  }
}
