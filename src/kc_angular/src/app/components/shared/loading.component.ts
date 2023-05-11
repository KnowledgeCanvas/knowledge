/*
 * Copyright (c) 2023 Rob Royce
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import { Component } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-loading',
  template: `
    <div
      class="flex flex-column w-full h-full justify-content-center align-items-center"
    >
      <div class="text-2xl">{{ message }}</div>
      <div class="text-500 pt-2">{{ subMessage }}</div>
      <p-progressBar
        *ngIf="progressBar"
        mode="indeterminate"
        class="w-full pt-4"
        [style]="{ height: '2px' }"
      ></p-progressBar>
    </div>
  `,
  styles: [],
})
export class LoadingComponent {
  message = 'Loading...';
  subMessage = '';
  progressBar = false;

  constructor(
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig
  ) {
    if (this.config.data) {
      this.message = this.config.data.message || this.message;
      this.subMessage = this.config.data.subMessage || this.subMessage;
      this.progressBar = this.config.data.progressBar || this.progressBar;
    }
  }
}
