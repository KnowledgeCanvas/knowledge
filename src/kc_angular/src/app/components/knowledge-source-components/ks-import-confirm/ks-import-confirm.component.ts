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

import {Component, OnDestroy, OnInit} from '@angular/core';
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";

@Component({
  selector: 'app-ks-import-confirm',
  templateUrl: './ks-import-confirm.component.html',
  styleUrls: ['./ks-import-confirm.component.scss']
})
export class KsImportConfirmComponent implements OnInit, OnDestroy {
  currentProjectName: string = '';
  countdownSeconds = 5;
  interval: any;

  constructor(private ref: DynamicDialogRef, private config: DynamicDialogConfig) {
    this.currentProjectName = config.data.projectName;
    this.countdownSeconds = config.data.countdownSeconds
  }

  ngOnInit(): void {
    this.interval = setInterval(() => {
      if (this.countdownSeconds === 0) {
        this.ref.close('queue');
      }
      this.countdownSeconds -= 1;
    }, 1000);
  }

  ngOnDestroy() {
    clearInterval(this.interval);
  }

  select(selection: string) {
    clearInterval(this.interval);
    this.ref.close(selection);
  }
}
