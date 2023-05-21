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

@Component({
  selector: 'app-setting-template',
  template: `
    <div
      class="w-full flex flex-row justify-content-between align-items-center"
    >
      <div class="flex flex-column gap-1">
        <div class="flex flex-row gap-2">
          <div>
            {{ label }}
          </div>
          <div *ngIf="labelHelp">
            <div
              class="pi pi-question-circle"
              (click)="helpClick()"
              [pTooltip]="
                labelHelp + (labelHelpLink ? ' (click to learn more)' : '')
              "
            ></div>
          </div>
        </div>
        <div class="text-500">
          {{ labelSubtext }}
        </div>
      </div>

      <div class="flex flex-column gap-1">
        <ng-content select=".settings-input"></ng-content>
        <div class="w-full flex flex-row justify-content-between">
          <ng-content select=".settings-input-subtext-left"></ng-content>
          <ng-content select=".settings-input-subtext-right"></ng-content>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        margin-top: 1rem;
      }
    `,
  ],
})
export class SettingTemplateComponent {
  @Input() label = '';

  @Input() labelSubtext = '';

  @Input() labelHelp = '';

  @Input() labelHelpLink = '';

  @Input() actionSubtext = '';

  @Input() actionDisabled = false;

  helpClick() {
    if (this.labelHelpLink) {
      window.open(this.labelHelpLink);
    }
  }
}
