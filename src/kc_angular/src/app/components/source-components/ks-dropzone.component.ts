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
import { Component, Input } from '@angular/core';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';

@Component({
  selector: 'app-dropzone',
  template: `
    <div
      [@dropzone-shorten]="shouldShorten ? 'dropzone-sm' : 'dropzone-lg'"
      class="dropzone select-none border-round-top-2xl"
    >
      <div class="flex-col-center-center">
        <b class="text-xl text-600">{{ emptyMessage }}</b>
      </div>
      <div class="flex-col-center-center">
        <div class="text-500">{{ hintMessage }}</div>
      </div>
    </div>
  `,
  styles: [
    `
      .dropzone {
        width: 100%;
        color: var(--text-color);
        background-image: linear-gradient(
          225deg,
          var(--surface-b) 25%,
          var(--surface-c) 25%,
          var(--surface-c) 50%,
          var(--surface-b) 50%,
          var(--surface-b) 75%,
          var(--surface-c) 75%,
          var(--surface-c) 100%
        );
        background-size: 64px 64px;
        display: flex;
        flex-direction: column;
        flex-wrap: nowrap;
        align-items: center;
        justify-content: center;
        align-content: center;
      }
    `,
  ],
  animations: [
    trigger('dropzone-shorten', [
      state('dropzone-lg', style({ height: '20vh', top: 0, left: 0 })),
      state('dropzone-sm', style({ height: '4rem', top: 0, left: 0 })),
      transition('dropzone-lg => dropzone-sm', [animate('0.1s')]),
      transition('dropzone-sm => dropzone-lg', [animate('0.1s')]),
    ]),
  ],
})
export class KsDropzoneComponent {
  @Input() shouldShorten = false;

  @Input() supportedTypes: string[] = [];

  @Input() emptyMessage = 'Drag and drop here!';

  @Input() hintMessage =
    'Hint: You can drag files and links directly into this window.';
}
