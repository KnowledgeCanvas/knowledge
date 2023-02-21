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

import {Component} from '@angular/core';
import {ThemeService} from "./services/theme.service";

@Component({
  selector: 'startup-root',
  template: `
    <div class="w-full h-full surface-a flex-col-center-center gap-4 draggable select-none" style="height: 100vh; width: 100vw;">
      <div class="flex flex-column align-items-center justify-content-center no-select select-none">
        <img src="assets/img/kc-logo-transparent.svg"
             alt="Knowledge Logo"
             height="128"
             class="select-none">
      </div>
      <div style="height: 10px"></div>
      <div style="width: 100%" class="w-full flex-col-center-center gap-2">
        <p-progressBar mode="indeterminate" class="w-full px-8" [style]="{'height': '0.5rem'}"></p-progressBar>
        <div class="font-light text-700">
          {{startupStatus}}
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .draggable {
        -webkit-user-select: none;
        -webkit-app-region: drag;
      }
    `
  ]
})
export class AppComponent {
  title = 'Knowledge Startup';

  startupStatus: string = "Getting things ready...";

  constructor(private themes: ThemeService) {
    themes.setLocal().then((result) => {
      console.log('Theme result: ', result);
    })
  }
}
