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
import { FormBuilder, FormGroup } from '@angular/forms';
import { ChatSettingsModel } from '@shared/models/settings.model';
import { SettingsService } from '@services/ipc-services/settings.service';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { NotificationsService } from '@services/user-services/notifications.service';

@Component({
  selector: 'app-chat-settings',
  template: `
    <div class="p-fluid grid">
      <form [formGroup]="form" class="w-full h-full">
        <div class="col-12">
          <p-panel [toggleable]="true" toggler="header">
            <ng-template pTemplate="header">
              <div class="flex-row-center-between w-full">
                <div class="text-2xl">Chat Settings</div>
              </div>
            </ng-template>
            <ng-template pTemplate="content">
              <div class="w-full h-full flex flex-column">
                <app-setting-template
                  class="w-full"
                  label="Automatic Introductions"
                  labelHelp="Enable or disable automatic introductions when a Source has no chat history."
                  labelSubtext="{{
                    form.controls.introductions.value | switchLabel
                  }}"
                >
                  <p-inputSwitch
                    class="settings-input"
                    formControlName="introductions"
                  ></p-inputSwitch>
                </app-setting-template>

                <p-divider layout="horizontal"></p-divider>

                <app-setting-template
                  class="w-full"
                  label="Next Question Suggestions"
                  labelHelp="Enable or disable automatically generating suggestions for the next question to ask."
                  labelSubtext="{{
                    form.controls.suggestionsEnabled.value | switchLabel
                  }}"
                >
                  <p-inputSwitch
                    class="settings-input"
                    formControlName="suggestionsEnabled"
                  ></p-inputSwitch>
                </app-setting-template>

                <p-divider layout="horizontal"></p-divider>

                <app-setting-template
                  class="w-full"
                  label="Next Question on Input"
                  labelHelp="When enabled, generate new question suggestions when you click on the chat text input."
                  labelSubtext="{{
                    form.controls.suggestionsOnInput.value | switchLabel
                  }}"
                >
                  <p-inputSwitch
                    class="settings-input"
                    formControlName="suggestionsOnInput"
                  ></p-inputSwitch>
                </app-setting-template>
              </div>
            </ng-template>
          </p-panel>
        </div>

        <div class="col-12">
          <p-panel [toggleable]="true" toggler="header">
            <ng-template pTemplate="header">
              <div class="flex-row-center-between w-full">
                <div class="text-2xl">OpenAI API</div>
              </div>
            </ng-template>
            <ng-template pTemplate="content">
              <div class="w-full h-full flex flex-column">
                <app-setting-template
                  class="w-full"
                  label="Model"
                  labelHelp="Choose the OpenAI model to use for chat. (Limited to GPT-3.5 Turbo until the next release)."
                  labelHelpLink="https://platform.openai.com/docs/models"
                >
                  <p-dropdown
                    class="settings-input w-12rem"
                    formControlName="modelName"
                    [options]="openAiModels"
                    optionLabel="label"
                    optionValue="name"
                  ></p-dropdown>
                </app-setting-template>

                <p-divider layout="horizontal"></p-divider>

                <app-setting-template
                  label="Temperature"
                  labelHelp="What sampling temperature to use, between 0 and 2. Higher values like 0.8 will make the output more random, while lower values like 0.2 will make it more focused and deterministic."
                  labelHelpLink="https://platform.openai.com/docs/api-reference/completions/create#completions/create-temperature"
                  labelSubtext="{{
                    form.controls.temperature.value | number : '1.1'
                  }}"
                >
                  <p-slider
                    class="w-16rem settings-input"
                    [min]="0"
                    [max]="2"
                    [step]="0.1"
                    formControlName="temperature"
                  ></p-slider>
                  <div class="settings-input-subtext-left">Concise</div>
                  <div class="settings-input-subtext-right">Creative</div>
                </app-setting-template>

                <p-divider layout="horizontal"></p-divider>

                <app-setting-template
                  label="Top Probability"
                  labelHelp="An alternative to sampling with temperature, called nucleus sampling, where the model considers the results of the tokens with top_p probability mass. So 0.1 means only the tokens comprising the top 10% probability mass are considered."
                  labelHelpLink="https://platform.openai.com/docs/api-reference/completions/create#completions/create-top_p"
                  labelSubtext="{{
                    form.controls.top_p.value | number : '1.1'
                  }}"
                >
                  <p-slider
                    class="w-16rem settings-input"
                    [min]="0.05"
                    [max]="1"
                    [step]="0.05"
                    formControlName="top_p"
                  ></p-slider>
                </app-setting-template>

                <p-divider layout="horizontal"></p-divider>

                <app-setting-template
                  label="Max Tokens"
                  labelHelp="The maximum number of tokens to generate in the completion. The token count of your prompt plus max_tokens cannot exceed the model's context length."
                  labelHelpLink="https://platform.openai.com/docs/api-reference/completions/create#completions/create-max_tokens"
                  labelSubtext="{{
                    form.controls.max_tokens.value | number : '1.0'
                  }}"
                >
                  <p-slider
                    class="w-16rem settings-input"
                    [min]="64"
                    [max]="512"
                    [step]="16"
                    formControlName="max_tokens"
                  ></p-slider>
                </app-setting-template>

                <p-divider layout="horizontal"></p-divider>

                <app-setting-template
                  label="Presence Penalty"
                  labelHelp="Number between -2.0 and 2.0. Positive values penalize new tokens based on whether they appear in the text so far, increasing the model's likelihood to talk about new topics."
                  labelHelpLink="https://platform.openai.com/docs/api-reference/completions/create#completions/create-presence_penalty"
                  labelSubtext="{{
                    form.controls.presence_penalty.value | number : '1.0'
                  }}"
                >
                  <p-slider
                    class="w-16rem settings-input"
                    [min]="-2"
                    [max]="2"
                    [step]="0.1"
                    formControlName="presence_penalty"
                  ></p-slider>
                </app-setting-template>

                <p-divider layout="horizontal"></p-divider>

                <app-setting-template
                  label="Frequency Penalty"
                  labelHelp="Number between -2.0 and 2.0. Positive values penalize new tokens based on their existing frequency in the text so far, decreasing the model's likelihood to repeat the same line verbatim."
                  labelHelpLink="https://platform.openai.com/docs/api-reference/completions/create#completions/create-frequency_penalty"
                  labelSubtext="{{
                    form.controls.frequency_penalty.value | number : '1.0'
                  }}"
                >
                  <p-slider
                    class="w-16rem settings-input"
                    [min]="-2"
                    [max]="2"
                    [step]="0.1"
                    formControlName="frequency_penalty"
                  ></p-slider>
                </app-setting-template>
              </div>
            </ng-template>
          </p-panel>
        </div>
      </form>
    </div>
  `,
  styles: [],
})
export class ChatSettingsComponent {
  chatSettings: ChatSettingsModel = new ChatSettingsModel();
  form: FormGroup;
  openAiModels: { name: string; label: string }[] = [
    { name: 'gpt-3.5-turbo-0301', label: 'GPT-3.5 Turbo' },
  ];

  constructor(
    private notify: NotificationsService,
    private settings: SettingsService,
    private formBuilder: FormBuilder
  ) {
    if (!settings.get().app.chat) {
      this.set();
    } else {
      this.chatSettings = {
        ...this.chatSettings,
        ...settings.get().app.chat,
      };
    }

    this.form = this.formBuilder.group({
      suggestionsEnabled: [this.chatSettings.suggestions.enabled],
      suggestionsOnInput: [this.chatSettings.suggestions.onInput],
      introductions: [this.chatSettings.display.introductions],
      modelName: [this.chatSettings.model.name],
      temperature: [this.chatSettings.model.temperature],
      top_p: [this.chatSettings.model.top_p],
      max_tokens: [this.chatSettings.model.max_tokens],
      presence_penalty: [this.chatSettings.model.presence_penalty],
      frequency_penalty: [this.chatSettings.model.frequency_penalty],
    });
    this.disable();

    this.form.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(this.checkChanges),
        tap((formValue) => {
          const chatSettings: ChatSettingsModel = {
            display: {
              introductions: formValue.introductions,
            },
            suggestions: {
              enabled: formValue.suggestionsEnabled,
              onInput: formValue.suggestionsOnInput,
            },
            model: {
              name: formValue.modelName,
              temperature: formValue.temperature,
              top_p: formValue.top_p,
              max_tokens: formValue.max_tokens,
              presence_penalty: formValue.presence_penalty,
              frequency_penalty: formValue.frequency_penalty,
            },
          };

          if (!this.validate(chatSettings)) {
            this.explain();
          }

          this.chatSettings = chatSettings;
          this.disable();
          this.set();
        })
      )
      .subscribe();

    this.notify.debug('Chat Settings', 'Initialized', this.chatSettings);
  }

  private explain() {
    this.notify.warn(
      'Chat Settings',
      'Not Recommended',
      'The OpenAI API suggests that you do not attempt to set custom values for both temperature and top_p.',
      'toast',
      10000
    );
  }

  private checkChanges(prev: any, curr: any) {
    return (
      curr.suggestionsEnabled === prev.suggestionsEnabled &&
      curr.suggestionsOnInput === prev.suggestionsOnInput &&
      curr.introductions === prev.introductions &&
      curr.modelName === prev.modelName &&
      curr.temperature === prev.temperature &&
      curr.top_p === prev.top_p
    );
  }

  private disable() {
    this.chatSettings.suggestions.enabled
      ? this.form.get('suggestionsOnInput')?.enable()
      : this.form.get('suggestionsOnInput')?.disable();
  }

  private set() {
    this.settings.set({
      app: {
        chat: this.chatSettings,
      },
    });
  }

  private validate(chatSettings: ChatSettingsModel): boolean {
    if (
      chatSettings.model.temperature !== 1 &&
      chatSettings.model.top_p !== 1
    ) {
      return false;
    } else {
      return true;
    }
  }
}
