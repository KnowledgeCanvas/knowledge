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

import {Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges} from '@angular/core';
import {DisplaySettingsModel} from "../../../../../ks-lib/src/lib/models/settings.model";
import {MatSlideToggleChange} from "@angular/material/slide-toggle";
import {ElectronIpcService} from "../../../../../ks-lib/src/lib/services/electron-ipc/electron-ipc.service";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-display-settings',
  templateUrl: './display-settings.component.html',
  styleUrls: ['./display-settings.component.scss']
})
export class DisplaySettingsComponent implements OnInit, OnChanges, OnDestroy {
  fontSize = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24];
  @Input() displaySettings: DisplaySettingsModel = {theme: 'app-theme-dark'};
  @Output() settingsModified = new EventEmitter<DisplaySettingsModel>();
  darkMode: boolean = true;
  currentVersion: string = '';
  versionSubscriber: Subscription;
  checkingForUpdate: boolean = false;
  updateButtonMessage: string = 'Check for Updates';

  constructor(private ipcService: ElectronIpcService) {
    this.versionSubscriber = ipcService.version.subscribe((version) => {
      this.currentVersion = version;
    })

  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.displaySettings.currentValue || changes.displaySettings.firstChange) {
      this.darkMode = changes.displaySettings.currentValue.theme === 'app-theme-dark';
    }
  }

  ngOnDestroy() {
    this.versionSubscriber.unsubscribe();
  }

  setFontSize(size: number) {
    let all = document.querySelectorAll('.kc-font-changeable');
    all.forEach((value) => {
      value.setAttribute('style', `font-size:${size}px;`);
    });
  }

  themeChanged($event: MatSlideToggleChange) {
    this.displaySettings.theme = $event.checked ? 'app-theme-dark' : 'app-theme-light';
    this.settingsModified.emit(this.displaySettings);
  }

  checkForUpdates() {
    this.ipcService.checkForUpdates();
    this.checkingForUpdate = true;
    this.updateButtonMessage = "Checking..."
    setTimeout(() => {
      this.updateButtonMessage = "Already up to date!"
    }, 3000);
  }
}
