import {Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges} from '@angular/core';
import {DisplaySettingsModel, IngestSettingsModel} from "../../../../../ks-lib/src/lib/models/settings.model";
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
    all.forEach((value, key, parent) => {
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
