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

import { Component, OnInit, ViewChild } from '@angular/core';
import { KnowledgeSource } from '@app/models/knowledge.source.model';
import { AgentType, ChatMessage } from '@app/models/chat.model';
import { ChatService } from '@services/chat-services/chat.service';
import { SourceChat } from '@services/chat-services/source';
import { finalize, take, tap } from 'rxjs/operators';
import { ChatViewComponent } from '@components/chat-components/chat.view.component';
import { NotificationsService } from '@services/user-services/notifications.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'source-chat',
  template: `
    <div class="h-full w-full flex flex-column">
      <app-chat-view
        #chatView
        [history]="history"
        [loading]="(loading$ | async)!"
        (submit)="submit($event)"
        (regenerate)="regenerate($event)"
        (delete)="delete($event)"
        style="height: 100% !important;"
      ></app-chat-view>
    </div>
    <p-dialog [(visible)]="showQuestion" [modal]="true" header="Source Q&A">
      <div *ngIf="context">
        <h3>Context:</h3>
        <div
          style="max-width: 64rem; max-height: 16rem;"
          class="text-500 overflow-y-auto"
        >
          {{ context }}
        </div>
      </div>
      <h3>Ask a question:</h3>
      <div>
        <input
          #question
          pInputText
          class="w-full p-fluid"
          placeholder="Type your question here, then press enter..."
          (keydown.enter)="ask(question.value)"
        />
      </div>
    </p-dialog>
  `,
  styleUrls: ['./source.styles.scss'],
})
export class SourceChatComponent implements OnInit {
  @ViewChild('chatView') chatView!: ChatViewComponent;

  source!: KnowledgeSource; // Must be passed in during dynamic component creation

  history: ChatMessage[] = [];

  private _loading = new BehaviorSubject<boolean>(false);
  loading$ = this._loading.asObservable();

  showQuestion = false;

  context?: string;

  constructor(
    private chat: ChatService,
    private sourceChat: SourceChat,
    private notify: NotificationsService
  ) {}

  ngOnInit() {
    // Load history
    this.history = this.chat.loadChat(this.source.id, undefined, this.source);
    if (this.history.length === 0) {
      this._loading.next(true);
      this.addMessage(
        AgentType.User,
        AgentType.Source,
        `Summarize "${this.source.title}"`
      );

      this.sourceChat
        .intro(this.source)
        .pipe(
          take(1),
          tap((response) => {
            if (response.content) {
              this.addMessage(
                AgentType.Source,
                AgentType.User,
                response.content
              );
            }
          }),
          finalize(() => {
            this._loading.next(false);
          })
        )
        .subscribe();
    }
  }

  showQuestionDialog(context?: string) {
    this.context = context;
    this.showQuestion = true;
  }

  addMessage(from: AgentType, to: AgentType, content: string) {
    this.history.push(
      this.chat.createMessage(from, to, content, undefined, this.source)
    );
    if (this.chatView) {
      this.chatView.scroll();
    }
    this.chat.saveChat(this.history, this.source.id);
  }

  submit($event: string) {
    this.addMessage(AgentType.User, AgentType.Source, $event);
    this._loading.next(true);
    this.sourceChat
      .send(this.source, this.history, $event)
      .pipe(
        take(1),
        tap((response) => {
          if (response.content) {
            this.addMessage(AgentType.Source, AgentType.User, response.content);
          }
        }),
        finalize(() => {
          this._loading.next(false);
        })
      )
      .subscribe();
  }

  regenerate(message: ChatMessage) {
    this._loading.next(true);
    this.sourceChat
      .regenerate(this.source, message, this.history)
      .pipe(
        tap((response) => {
          this.history = this.history.map((m) => {
            if (m.id === message.id) {
              m.text = response.content ?? '';
            }
            return m;
          });
          this.chat.saveChat(this.history, this.source.id);
        }),
        finalize(() => {
          this._loading.next(false);
        })
      )
      .subscribe();
  }

  delete(messages: ChatMessage[]) {
    for (const message of messages) {
      this.history = this.history.filter((m) => m.id !== message.id);
    }

    this.chat.saveChat(this.history, this.source.id);
  }

  ask(value: string) {
    this.showQuestion = false;
    this.submit(
      `Context: ${this.context}\n\n\nPlease answer the following question: ${value}`
    );
  }
}
