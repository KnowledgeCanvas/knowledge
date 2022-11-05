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
import {ThemeService} from "../../services/user-services/theme.service";
import {SettingsService} from "../../services/ipc-services/settings.service";
import {NotificationsService} from "../../services/user-services/notifications.service";
import {KcTheme} from "../../../../../kc_shared/models/style.model";
import {DisplaySettingsModel} from "../../../../../kc_shared/models/settings.model";


@Component({
  selector: 'app-display-settings',
  template: `
    <div class="p-fluid grid">
      <div class="col-12">
        <p-panel header="Display Settings">
          <ng-template pTemplate="content">
            <div class="w-full h-full flex flex-column gap-2">
              <div class="flex flex-row justify-content-between align-items-center">
                <div>Select a theme:</div>
                <div class="p-inputgroup w-16rem">
                  <button pButton icon="pi pi-replay" pTooltip="Restore default" (click)="restoreDefaultTheme()"></button>
                  <p-dropdown [(ngModel)]="selectedTheme"
                              [options]="themes"
                              optionLabel="name"
                              [filter]="true"
                              [group]="true"
                              id="theme-dropdown"
                              [style]="{'width': '100%'}"
                              appendTo="body"
                              (onChange)="onThemeChange($event)">
                    <ng-template pTemplate="group" let-group>
                      <p-divider></p-divider>
                      <b>{{group.name}}</b>
                      <b *ngIf="group.isDark"> (Dark)</b>
                      <b *ngIf="!group.isDark"> (Light)</b>
                    </ng-template>
                  </p-dropdown>
                </div>
              </div>

              <p-divider layout="horizontal"></p-divider>

              <div class="flex flex-row justify-content-between align-items-center">
                <div>Set zoom level:</div>
                <div class="p-inputgroup w-16rem">
                  <button pButton icon="pi pi-minus" pTooltip="Zoom Out" (click)="decrementZoom($event)"></button>
                  <p-inputNumber [(ngModel)]="zoomLevel" [disabled]="true" [suffix]="'%'" [min]="50" [max]="300"></p-inputNumber>
                  <button pButton icon="pi pi-plus" pTooltip="Zoom In" (click)="incrementZoom($event)"></button>
                </div>
              </div>

              <p-divider layout="horizontal"></p-divider>

              <div class="flex flex-row justify-content-between align-items-center">
                <div>Enable log notifications:</div>
                <p-selectButton [options]="logLevels"
                                [(ngModel)]="logLevel"
                                [multiple]="true"
                                id="log-selector"
                                class="w-24rem"
                                (onChange)="onLoggingChange($event)"
                                optionLabel="name"
                                optionValue="value">
                </p-selectButton>
              </div>
            </div>
          </ng-template>
        </p-panel>
      </div>
      <!--      <div class="col-12">-->
      <!--        <p-panel header="Zoom">-->
      <!--          <ng-template pTemplate="content">-->
      <!--            <div class="flex flex-row justify-content-between align-items-center">-->
      <!--              <div>Set zoom level:</div>-->
      <!--              <div class="p-inputgroup w-16rem">-->
      <!--                <button pButton icon="pi pi-minus" pTooltip="Zoom Out" (click)="decrementZoom($event)"></button>-->
      <!--                <p-inputNumber [(ngModel)]="zoomLevel" [disabled]="true" [suffix]="'%'" [min]="50" [max]="300"></p-inputNumber>-->
      <!--                <button pButton icon="pi pi-plus" pTooltip="Zoom In" (click)="incrementZoom($event)"></button>-->
      <!--              </div>-->
      <!--            </div>-->
      <!--          </ng-template>-->
      <!--        </p-panel>-->
      <!--      </div>-->
      <!--      <div class="col-12">-->
      <!--        <p-panel header="Logging">-->
      <!--          <ng-template pTemplate="content">-->
      <!--            <label for="log-selector">Enable Log Notifications</label>-->
      <!--            <p-selectButton [options]="logLevels"-->
      <!--                            [(ngModel)]="logLevel"-->
      <!--                            [multiple]="true"-->
      <!--                            id="log-selector"-->
      <!--                            (onChange)="onLoggingChange($event)"-->
      <!--                            optionLabel="name"-->
      <!--                            optionValue="value">-->
      <!--            </p-selectButton>-->
      <!--          </ng-template>-->
      <!--        </p-panel>-->
      <!--      </div>-->
    </div>
  `,
  styles: []
})
export class DisplaySettingsComponent implements OnInit {
  private send = window.api.send;
  private receive = window.api.receive;
  private channels = {
    zoomIn: 'A2E:Window:ZoomIn',
    zoomOut: 'A2E:Window:ZoomOut',
    zoomLevel: 'E2A:Window:ZoomLevel'
  }

  displaySettings?: DisplaySettingsModel;

  themes: KcTheme[];

  selectedTheme?: KcTheme;

  logLevels = [
    {name: 'Error', value: 'error'},
    {name: 'Warn', value: 'warn'},
    {name: 'Debug', value: 'debug'}
  ];

  logLevel: string[] = [];

  zoomLevel: number = 100;

  constructor(private themeService: ThemeService,
              private settingsService: SettingsService,
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

      if (!displaySettings.zoom) {
        displaySettings.zoom = 100;
      } else {
        this.zoomLevel = displaySettings.zoom;
      }

      this.send(this.channels.zoomIn, this.zoomLevel);
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

  decrementZoom(_: MouseEvent) {
    this.zoomLevel = Math.max(this.zoomLevel - 10, 50);
    this.send(this.channels.zoomOut, this.zoomLevel);
    if (this.displaySettings) {
      this.displaySettings.zoom = this.zoomLevel;
      this.settingsService.set({display: this.displaySettings});
    }
  }

  incrementZoom(_: MouseEvent) {
    this.zoomLevel = Math.min(this.zoomLevel + 10, 150);
    this.send(this.channels.zoomIn, this.zoomLevel);

    if (this.displaySettings) {
      this.displaySettings.zoom = this.zoomLevel;
      this.settingsService.set({display: this.displaySettings});
    }
  }
}
