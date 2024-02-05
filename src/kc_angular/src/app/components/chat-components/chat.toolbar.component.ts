/*
 * Copyright (c) 2023-2024 Rob Royce
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
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { SettingsService } from '@services/ipc-services/settings.service';
import { ChatModel, SupportedChatModels } from '@shared/models/chat.model';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ChatSettingsModel } from '@shared/models/settings.model';
import { ChatService } from '@services/chat-services/chat.service';

@Component({
  selector: 'chat-toolbar',
  template: `
    <div
      class="flex flex-row justify-content-between px-2 py-2 top-0"
      id="chat-toolbar"
    >
      <div class="chat-toolbar-model-selector">
        <form [formGroup]="form">
          <p-dropdown
            class="settings-input w-12rem"
            formControlName="modelName"
            [options]="SupportedChatModels"
            optionLabel="label"
            optionValue="name"
          ></p-dropdown>
        </form>
      </div>

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
          pTooltip="Clear Chat"
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
          pTooltip="Chat Settings"
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

  form: FormGroup;

  settingsModel: ChatSettingsModel = new ChatSettingsModel();

  constructor(
    private settings: SettingsService,
    private fb: FormBuilder,
    private chat: ChatService
  ) {
    const chatSettings = this.settings.get().app.chat;
    if (!chatSettings) {
      this.set();
    } else {
      this.settingsModel = {
        ...this.chatSettings,
        ...chatSettings,
      };
    }

    // Create form group for chat model selector
    this.form = this.fb.group({
      modelName: [this.settingsModel.model.name],
    });

    this.filter$
      .pipe(
        skip(1),
        debounceTime(500),
        tap((filterValue: string) => {
          this.onFilter.emit(filterValue);
        })
      )
      .subscribe();

    // Listen for changes in the chat model setting, update if there are any
    this.form.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        tap((formValue) => {
          let model: ChatModel;

          // If the model has changed, update the local copy with static values from the SupportedChatModels array.
          if (formValue.modelName !== this.settingsModel.model.name) {
            model =
              SupportedChatModels.find((m) => m.name === formValue.modelName) ??
              this.settingsModel.model;
          } else {
            return;
          }

          this.settingsModel = {
            display: this.settingsModel.display,
            suggestions: this.settingsModel.suggestions,
            model: model,
          };
          this.set();
        })
      )
      .subscribe();

    this.settings.all
      .pipe(
        tap((settings) => {
          if (settings.app.chat) {
            this.settingsModel = {
              ...this.settingsModel,
              ...settings.app.chat,
            };
            this.form.patchValue({
              modelName: this.settingsModel.model.name,
            });
          }
        })
      )
      .subscribe();

    this.chat.loading$
      .pipe(
        tap((loading) => {
          loading
            ? this.form.get('modelName')?.disable()
            : this.form.get('modelName')?.enable();
        })
      )
      .subscribe();
  }

  /* Filter the chat based on the value of the filter input */
  filter(value: string) {
    this._filter$.next(value);
  }

  private set() {
    this.settings.set({
      app: {
        chat: this.settingsModel,
      },
    });
  }

  chatSettings() {
    this.settings.show('chat');
  }

  clearChat() {
    this.onClear.emit();
  }

  protected readonly SupportedChatModels = SupportedChatModels;
}
