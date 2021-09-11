import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {KsQueueService} from "../../knowledge-source/ks-queue-service/ks-queue.service";
import {SettingsService} from "../../../../../ks-lib/src/lib/services/settings/settings.service";
import {KsFactoryService} from "../../../../../ks-lib/src/lib/services/ks-factory/ks-factory.service";
import {KsPreviewComponent, KsPreviewInput} from "../../knowledge-source/ks-preview/ks-preview.component";
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import {BrowserViewDialogService} from "../../../../../ks-lib/src/lib/services/browser-view-dialog/browser-view-dialog.service";

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss']
})
export class SearchBarComponent implements OnInit {
  recents: string[] = [];
  searchForm: FormGroup;
  searchTerm = new FormControl();
  searchResults: string = '';
  darkMode: boolean = true;

  constructor(private browserViewDialogService: BrowserViewDialogService,
              private settingsService: SettingsService,
              private searchService: KsQueueService,
              private ksFactory: KsFactoryService,
              private dialog: MatDialog,
              private fb: FormBuilder,) {
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

  EnterSubmit($event: any) {
    let ks = this.ksFactory.searchKS(this.searchTerm.value);

    let dialogRef = this.browserViewDialogService.open({ks: ks});

    dialogRef.afterClosed().subscribe((results) => {
      this.searchTerm.reset();
    });

    this.recents.unshift(this.searchTerm.value);

    this.recents.length = this.recents.length < 5 ? this.recents.length : 5;
  }
}
