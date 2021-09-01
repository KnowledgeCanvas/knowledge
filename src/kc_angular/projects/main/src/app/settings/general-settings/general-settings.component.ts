import { Component, OnInit } from '@angular/core';
import {SettingsService} from "../../../../../ks-lib/src/lib/services/settings/settings.service";
import {IngestSettingsModel, SettingsModel} from "projects/ks-lib/src/lib/models/settings.model";

@Component({
  selector: 'app-general-settings',
  templateUrl: './general-settings.component.html',
  styleUrls: ['./general-settings.component.scss']
})
export class GeneralSettingsComponent implements OnInit {
  private settings: SettingsModel = {};
  ingest: IngestSettingsModel = {autoscan: false, managed: false};

  constructor(private settingsService: SettingsService) {
    settingsService.settings.subscribe(settings => {
      this.settings = settings;
      if (settings.ingest)
        this.ingest = settings.ingest;
      console.log('Got settings: ', settings);
    });
  }

  ngOnInit(): void {
  }

  ingestSettingsModified(ingestSettings: IngestSettingsModel) {
    console.log('Settings have been modified: ', ingestSettings);
    this.settingsService.saveSettings({ingest: ingestSettings});
  }
}
