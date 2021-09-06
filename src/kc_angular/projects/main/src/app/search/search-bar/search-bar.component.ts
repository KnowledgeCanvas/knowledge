import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {KsQueueService} from "../../knowledge-source/ks-queue-service/ks-queue.service";
import {SettingsService} from "../../../../../ks-lib/src/lib/services/settings/settings.service";

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss']
})
export class SearchBarComponent implements OnInit {
  searchForm: FormGroup;
  searchTerm = new FormControl();
  searchResults: string = '';
  darkMode: boolean = true;

  constructor(fb: FormBuilder, private searchService: KsQueueService,
              private settingsService: SettingsService) {
    this.searchForm = fb.group({
      searchTerm: this.searchTerm
    });

    settingsService.settings.subscribe((settings) => {
      if (settings.display) {
        this.darkMode = settings.display.theme === 'app-theme-dark';
      }
    })
  }

  ngOnInit(): void {
  }

  async EnterSubmit($event: any) {
    await this.searchService.search(this.searchTerm.value);
  }

}
