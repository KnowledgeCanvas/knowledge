import {Component, OnInit} from '@angular/core';
import {SettingsService} from "../../../../../ks-lib/src/lib/services/settings/settings.service";
import {IngestSettingsModel, SearchSettingsModel, SettingsModel} from "projects/ks-lib/src/lib/models/settings.model";

@Component({
  selector: 'app-general-settings',
  templateUrl: './general-settings.component.html',
  styleUrls: ['./general-settings.component.scss']
})
export class GeneralSettingsComponent implements OnInit {
  ingest: IngestSettingsModel | undefined = undefined;
  search: SearchSettingsModel | undefined = undefined;
  private settings: SettingsModel = {};

  constructor(private settingsService: SettingsService) {
    settingsService.settings.subscribe(settings => {
      this.settings = settings;

      if (settings.ingest) {
        this.ingest = settings.ingest;
      }

      if (settings.search) {
        this.search = settings.search;
      }
    });
  }

  ngOnInit(): void {
  }

  ingestSettingsModified(ingestSettings: IngestSettingsModel) {
    this.settingsService.saveSettings({ingest: ingestSettings});
  }

  searchSettingsModified(searchSettings: SearchSettingsModel) {
    this.settingsService.saveSettings({search: searchSettings});
  }
}
