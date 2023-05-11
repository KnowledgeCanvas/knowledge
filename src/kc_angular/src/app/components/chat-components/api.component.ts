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
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { ChatService } from '@services/chat-services/chat.service';

@Component({
  selector: 'app-api',
  template: `
    <div class="flex flex-column gap-2">
      <div>
        OpenAI API Key required to use the Chat feature. The key will be
        encrypted and stored locally.
      </div>
      <div class="api-key-form w-full">
        <input
          #apiKeyInput
          [autofocus]="true"
          pInputText
          type="password"
          class="w-full p-fluid"
          id="api-key-input"
          (keydown.enter)="saveApiKey(apiKeyInput.value)"
        />
      </div>
      <div class="flex flex-row w-full justify-content-end">
        <button pButton (click)="saveApiKey(apiKeyInput.value)">Submit</button>
      </div>
    </div>
  `,
  styles: [],
})
export class ChatApiComponent {
  constructor(private ref: DynamicDialogRef, private chat: ChatService) {}

  async saveApiKey(apiKey: string) {
    this.chat.setApiKey(apiKey).subscribe(
      (result: { success: boolean }) => {
        this.ref.close(result.success);
      },
      () => {
        this.ref.close(false);
      }
    );
  }
}
