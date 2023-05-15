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

import {
  Component,
  EventEmitter,
  HostListener,
  OnDestroy,
  Output,
} from '@angular/core';
import { SettingsService } from '@services/ipc-services/settings.service';

@Component({
  selector: 'app-pro-tips',
  template: `
    <div class="pro-tip">
      <div class="text-4xl {{ icon }}"></div>
      <h1>{{ header }}</h1>
      <div class="pro-tip-body">
        <p>{{ body }}</p>
      </div>
      <div
        class="pro-tip-footer flex-row-center-between"
        pTooltip="Hint: use the left and right arrow keys to switch between tips"
        tooltipPosition="bottom"
      >
        <button
          pButton
          class="p-button-text"
          icon="pi pi-arrow-left"
          (click)="previous.emit()"
        ></button>
        <button
          pButton
          class="p-button-text"
          icon="pi pi-arrow-right"
          (click)="next.emit()"
        ></button>
      </div>
    </div>
  `,
  styles: [
    `
      .pro-tip {
        max-width: 30rem !important;
      }
    `,
  ],
})
export class ProTipsComponent implements OnDestroy {
  header = 'Pro Tips';

  body = '';

  icon = 'pi pi-info-circle';

  @Output() previous = new EventEmitter();

  @Output() next = new EventEmitter();

  @Output() close = new EventEmitter();

  constructor(private settings: SettingsService) {}

  ngOnDestroy() {
    this.close.emit();
  }

  /* Listen for left and right arrow keys, emit previous and next events */
  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'ArrowRight') {
      this.next.emit();
    } else if (event.key === 'ArrowLeft') {
      this.previous.emit();
    }
  }

  showAgainChanged($event: { checked: boolean }) {
    console.log('Show again changed: ', $event.checked);
  }
}
