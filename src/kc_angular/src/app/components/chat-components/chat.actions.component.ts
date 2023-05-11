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

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AgentType } from '@app/models/chat.model';

@Component({
  selector: 'chat-actions',
  template: `
    <div class="chat-actions">
      <button
        pButton
        class="p-button-rounded p-button-text p-button-plain"
        icon="pi pi-question-circle"
        [ngClass]="{
          'user-action': type === 'user',
          'agent-action': type !== 'user'
        }"
        (click)="onGenerateNextQuestion.emit()"
      ></button>
      <button
        pButton
        *ngIf="type !== 'user'"
        class="p-button-rounded p-button-text p-button-plain agent-action"
        icon="pi pi-refresh"
        (click)="onRegenerateMessage.emit()"
      ></button>
      <button
        pButton
        class="p-button-rounded p-button-text p-button-plain p-button-danger"
        icon="pi pi-trash"
        [ngClass]="{
          'user-action': type === 'user',
          'agent-action': type !== 'user'
        }"
        (click)="onDeleteMessage.emit()"
      ></button>
    </div>
  `,
  styles: [
    `
      .message-actions {
        display: flex;
        align-items: center;
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      :host:hover .message-actions {
        opacity: 1;
      }

      .user-action {
        color: var(--primary-text-color) !important;
      }

      .agent-action {
        color: var(--primary-color) !important;
      }
    `,
  ],
})
export class ChatActionsComponent {
  /**
   * The type of the message sender (determines the color of the action buttons)
   */
  @Input() type!: AgentType;

  /**
   * Event emitted when the user clicks the delete button
   */
  @Output() onDeleteMessage: EventEmitter<void> = new EventEmitter<void>();

  /**
   * Event emitted when the user clicks the regenerate button
   */
  @Output() onRegenerateMessage: EventEmitter<void> = new EventEmitter<void>();

  /**
   * Event emitted when the user clicks the generate next question button
   */
  @Output() onGenerateNextQuestion: EventEmitter<void> =
    new EventEmitter<void>();
}
