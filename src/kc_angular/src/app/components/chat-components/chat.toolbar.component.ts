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
            proTip
            tipHeader="Find the Needle in the Chat Haystack!"
            tipMessage="Looking for a specific chat message? Use our filter input to sift through the chatter. Just type in what you're looking for, and voila! Your chat haystack just got a whole lot smaller."
            [tipGroups]="['chat']"
            tipIcon="pi pi-filter"
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
          proTip
          tipHeader="Too Much Chit-Chat?"
          tipMessage="Click here to erase all chat messages in the chat history. One click, and poof! It's like the chat history never happened. A fresh start awaits!"
          [tipGroups]="['chat']"
          tipIcon="pi pi-trash"
          icon="pi pi-trash"
          class="p-button-rounded p-button-text p-button-danger"
          tooltip="Clear Chat"
          (click)="clearChat()"
        ></div>
        <div
          pButton
          icon="pi pi-cog"
          proTip
          tipHeader="Fancy a Chat Makeover?"
          tipMessage="Click the chat settings button to spice up your chat experience! Customize away and make the chat truly yours. Your chat room, your rules!"
          [tipGroups]="['chat']"
          tipIcon="pi pi-cog"
          tooltip="Chat Settings"
          class="p-button-rounded p-button-text"
          (click)="chatSettings()"
        ></div>
      </div>
    </div>
  `,
  styles: [],
})
export class ChatToolbarComponent {
  @Output() onFilter = new EventEmitter<string>();

  @Output() onClear = new EventEmitter<void>();

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

  clearChat() {
    this.onClear.emit();
  }
}
