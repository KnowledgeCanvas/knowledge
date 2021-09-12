import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {DisplaySettingsModel, IngestSettingsModel} from "../../../../../ks-lib/src/lib/models/settings.model";
import {MatSlideToggleChange} from "@angular/material/slide-toggle";

@Component({
  selector: 'app-display-settings',
  templateUrl: './display-settings.component.html',
  styleUrls: ['./display-settings.component.scss']
})
export class DisplaySettingsComponent implements OnInit, OnChanges {
  fontSize = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24];
  @Input() displaySettings: DisplaySettingsModel = {theme: 'app-theme-dark'};
  @Output() settingsModified = new EventEmitter<DisplaySettingsModel>();
  darkMode: boolean = true;

  constructor() {
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.displaySettings.currentValue || changes.displaySettings.firstChange) {
      this.darkMode = changes.displaySettings.currentValue.theme === 'app-theme-dark';
    }
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
}
