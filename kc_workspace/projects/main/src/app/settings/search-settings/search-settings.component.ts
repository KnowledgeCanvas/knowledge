import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {SettingsService} from "../../../../../shared/src/services/settings/settings.service";

@Component({
  selector: 'app-search-settings',
  templateUrl: './search-settings.component.html',
  styleUrls: ['./search-settings.component.scss']
})
export class SearchSettingsComponent implements OnInit {
  numResults = 10;

  constructor(private settingsService: SettingsService, private ref: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.settingsService.searchSettings.subscribe((searchSettings) => {
      if (searchSettings.numResults)
        this.numResults = searchSettings.numResults;
    });
  }

  setNumResults() {
    this.settingsService.saveSettings({search: {numResults: this.numResults}});
  }
}
