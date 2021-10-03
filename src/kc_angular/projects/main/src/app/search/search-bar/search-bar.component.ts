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
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {KsQueueService} from "../../knowledge-source/ks-queue-service/ks-queue.service";
import {SettingsService} from "../../../../../ks-lib/src/lib/services/settings/settings.service";
import {KsFactoryService} from "../../../../../ks-lib/src/lib/services/ks-factory/ks-factory.service";
import {MatDialog} from "@angular/material/dialog";
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

  EnterSubmit(_: any) {
    let ks = this.ksFactory.searchKS(this.searchTerm.value);

    let dialogRef = this.browserViewDialogService.open({ks: ks});

    dialogRef.afterClosed().subscribe((_) => {
      this.searchTerm.reset();
    });

    this.recents.unshift(this.searchTerm.value);

    this.recents.length = this.recents.length < 5 ? this.recents.length : 5;
  }
}
