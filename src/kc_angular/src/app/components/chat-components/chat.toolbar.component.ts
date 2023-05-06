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

import { Component, EventEmitter, Output } from '@angular/core';
import { BehaviorSubject, skip } from 'rxjs';
import { debounceTime, tap } from 'rxjs/operators';
import { SettingsService } from '@services/ipc-services/settings.service';

@Component({
  selector: 'chat-toolbar',
  template: `
    <div
      class="flex flex-row justify-content-between top-0 pb-2"
      id="chat-toolbar"
    >
      <div></div>

      <div class="chat-toolbar-filter">
        <div class="p-inputgroup p-fluid mr-3 ml-3 w-24rem">
          <span class="p-inputgroup-addon">
            <i class="pi pi-filter"></i>
          </span>
          <input
            #tableFilter
            pInputText
            type="text"
            placeholder="Filter by keyword"
            (input)="filter(tableFilter.value)"
          />
          <span
            class="p-inputgroup-addon"
            [style.cursor]="tableFilter.value.length ? 'pointer' : 'unset'"
            (click)="tableFilter.value = ''; filter('')"
          >
            <i class="pi pi-times"></i>
          </span>
        </div>
      </div>
      <div class="chat-toolbar-actions">
        <div
          pButton
          icon="pi pi-save"
          class="p-button-rounded p-button-text"
          (click)="save.emit($event)"
        ></div>
        <div
          pButton
          icon="pi pi-cog"
          class="p-button-rounded p-button-text"
          (click)="chatSettings()"
        ></div>
      </div>
    </div>
  `,
  styles: [],
})
export class ChatToolbarComponent {
  /**
   * Event emitted when the user clicks the print button
   */
  @Output() save = new EventEmitter<MouseEvent>();

  @Output() onFilter = new EventEmitter<string>();

  private _filter$ = new BehaviorSubject<string>('');
  filter$ = this._filter$.asObservable();

  constructor(private settings: SettingsService) {
    this.filter$
      .pipe(
        skip(1),
        debounceTime(500),
        tap((filterValue: string) => {
          this.onFilter.emit(filterValue);
        })
      )
      .subscribe();
  }

  /* Filter the chat based on the value of the filter input */
  filter(value: string) {
    this._filter$.next(value);
  }

  chatSettings() {
    this.settings.show('chat');
  }
}
