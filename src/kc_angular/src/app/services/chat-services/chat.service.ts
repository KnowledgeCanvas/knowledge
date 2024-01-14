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

import { AgentType, ChatMessage } from '@app/models/chat.model';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, LOCALE_ID } from '@angular/core';
import { KcProject } from '@app/models/project.model';
import { KnowledgeSource } from '@app/models/knowledge.source.model';
import { NotificationsService } from '@services/user-services/notifications.service';
import { BehaviorSubject, Observable, tap, timeout } from 'rxjs';
import { UUID } from '@shared/models/uuid.model';
import { UuidService } from '@services/ipc-services/uuid.service';
import { ElectronIpcService } from '@services/ipc-services/electron-ipc.service';
import { DialogService } from 'primeng/dynamicdialog';
import { map } from 'rxjs/operators';
import { SettingsService } from '@services/ipc-services/settings.service';
import { ChatSettingsModel } from '@shared/models/settings.model';
import { ChatApiComponent } from '@components/chat-components/api.component';
import {
  ChatCompletionMessage,
  CreateChatCompletionRequestMessage,
} from 'openai/resources/chat/completions';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  // TODO in v0.8.1 make this more robust (dynamic port selection when necessary)
  private backendUrl = 'http://localhost:21003';

  private canConnect = new BehaviorSubject<boolean>(false);
  canConnect$ = this.canConnect.asObservable();

  private _settings: ChatSettingsModel = new ChatSettingsModel();

  private tokenCount = new BehaviorSubject<number>(0);

  tokenCount$ = this.tokenCount.asObservable();

  private tokenLimit = new BehaviorSubject<number>(4096);

  tokenLimit$ = this.tokenLimit.asObservable();

  constructor(
    private dialog: DialogService,
    private http: HttpClient,
    @Inject(LOCALE_ID) private locale: string,
    private notify: NotificationsService,
    private ipc: ElectronIpcService,
    private settings: SettingsService,
    private uuid: UuidService
  ) {
    this.checkConnection();

    settings.all
      .pipe(map((settings) => settings?.app?.chat ?? new ChatSettingsModel()))
      .subscribe((settings) => {
        this._settings = settings;
        this.tokenLimit.next(
          settings.model.token_limit - settings.model.max_tokens
        );
      });
  }

  get serverUrl() {
    return this.backendUrl;
  }

  checkConnection() {
    this.http.get(this.backendUrl + '/api/key').subscribe((result: any) => {
      if (result) {
        this.canConnect.next(result.apiKeySet);
      }
    });
  }

  getApiKeyDialog() {
    const dialogRef = this.dialog.open(ChatApiComponent, {
      header: 'OpenAI API Key Required',
    });

    return dialogRef.onClose.pipe(
      tap((result) => {
        if (result) {
          this.notify.success(
            'Chat Service',
            'Success',
            'API Key saved and encrypted.'
          );
        } else {
          this.notify.error(
            'Chat Service',
            'API Key Not Saved',
            'The API Key was either invalid or not entered properly.',
            'toast'
          );
        }
      })
    );
  }

  deleteApiKey() {
    return this.http.delete(this.backendUrl + '/api/key').pipe(
      tap((result: any) => {
        if (result) {
          this.canConnect.next(false);
        }
      })
    );
  }

  setApiKey(apiKey: string) {
    return this.http
      .post(this.backendUrl + '/api/key', { apiKey: apiKey })
      .pipe(
        tap((result: any) => {
          if (result) {
            this.canConnect.next(result.success);
          } else {
            this.canConnect.next(false);
          }
        })
      );
  }

  canChat() {
    return this.canConnect.value;
  }

  /* Create a new chat message */
  createMessage(
    sender: AgentType,
    recipient: AgentType,
    message: string,
    project?: KcProject,
    source?: KnowledgeSource
  ): ChatMessage {
    const id: UUID = this.uuid.generate(1)[0];
    return {
      id: id.value,
      sender: sender,
      recipient: recipient,
      text: message,
      timestamp: new Date(),
      project: project,
      source: source,
      rating: 'none',
    };
  }

  /* Convenience method for creating a new chat message based on a previous message */
  elaborate(
    history: ChatMessage[],
    method: 'ELI5' | 'TLDR' | 'Continue'
  ): Observable<ChatCompletionMessage> {
    const messages = this.convertToOpenAI(history);
    messages.push({
      role: 'user',
      content: method,
    });

    return this.send(messages);
  }

  intro(
    messages: CreateChatCompletionRequestMessage[],
    source: KnowledgeSource
  ): Observable<ChatCompletionMessage> {
    const body = {
      messages: messages,
      source: source,
    };
    const url = this.backendUrl + '/sources/intro';
    return this.http.post(url, body).pipe(
      map((response: any) => {
        return response.choices[0].message;
      })
    );
  }

  convertToOpenAI(
    messages: ChatMessage[]
  ): CreateChatCompletionRequestMessage[] {
    // Convert the chat messages to completion request messages. If a message has a 'thumbs-down' rating, omit it from the request
    const completions: CreateChatCompletionRequestMessage[] = [];
    messages.forEach((message) => {
      if (message.rating !== 'thumbs-down') {
        completions.push({
          role: message.sender === AgentType.User ? 'user' : 'assistant',
          content: message.text,
          name: message.sender,
        });
      }

      // TODO: Need to implement thumbs-up prioritization, but that will require a change to the
      //  request body (i.e. we will need to send the rating info to the backend).
    });
    return completions;
  }

  send(
    messages: CreateChatCompletionRequestMessage[]
  ): Observable<ChatCompletionMessage> {
    const body = { messages: messages };
    this.notify.debug('Chat Service', 'Sending OpenAI API Request', body);

    // Remove any empty messages
    body.messages = body.messages.filter(
      (message) => message.content?.trim() !== ''
    );

    return this.http.post(this.backendUrl + '/chat', body).pipe(
      timeout(60000),
      map((response: any) => {
        return response.choices[0].message;
      })
    );
  }

  /* Load chat history from local storage */
  loadChat(
    id: UUID,
    project?: KcProject,
    source?: KnowledgeSource
  ): ChatMessage[] {
    let history: ChatMessage[] = [];

    const chatHistory = localStorage.getItem(`chat-${id.value}`);
    if (chatHistory) {
      history = JSON.parse(chatHistory);
      for (const msg of history) {
        msg.timestamp = new Date(msg.timestamp);

        if (project) {
          msg.project = project;
        }
        if (source) {
          msg.source = source;
        }
      }
    }

    return history;
  }

  /* Save chat history to local storage */
  saveChat(history: ChatMessage[], id?: UUID): ChatMessage[] {
    /* If no ID is provided, save chat history for all sources and projects individually */
    this.notify.debug(
      'Chat Service',
      'Saving Chat',
      'Saving chat history to local storage'
    );
    if (!id) {
      // Get a list of all unique sources in the history
      const sources: KnowledgeSource[] = [];
      const projects: KcProject[] = [];
      for (const msg of history) {
        if (
          msg.source &&
          !sources.find((s) => s.id.value === msg.source?.id.value)
        ) {
          sources.push(msg.source);
        }

        if (
          msg.project &&
          !projects.find((p) => p.id.value === msg.project?.id.value)
        ) {
          projects.push(msg.project);
        }
      }

      // Save all source history
      for (const source of sources) {
        // Get history for this source
        const sourceHistory = history.filter(
          (m) => m.source?.id.value === source.id.value
        );

        // Save history for this source
        localStorage.setItem(
          `chat-${source.id.value}`,
          JSON.stringify(sourceHistory)
        );
      }

      // Save all project history
      for (const project of projects) {
        const projectHistory = history.filter(
          (m) => m.project?.id.value === project.id.value
        );
        localStorage.setItem(
          `chat-${project.id.value}`,
          JSON.stringify(projectHistory)
        );
      }

      return history;
    }

    /* If an ID is provided, save entire chat history using the ID as the key */
    const newHistory: ChatMessage[] = [];
    for (const msg of history) {
      newHistory.push({
        id: msg.id,
        sender: msg.sender,
        recipient: msg.recipient,
        text: msg.text,
        timestamp: msg.timestamp,
        project: undefined,
        source: undefined,
      });
    }
    localStorage.setItem(`chat-${id.value}`, JSON.stringify(newHistory));

    return newHistory;
  }

  /**
   * Returns a copy of the history, up to and including the target message
   * @param message The target message
   * @param history The entire history
   * @param inclusive Whether or not to include the target message in the context
   * @param rules if true, the history will be filtered depending on the source/project
   * @returns {ChatMessage[]} The history up to and including the target message.
   * If the target message is not in the history, then **an empty array is returned.**
   */
  getHistory(
    message: ChatMessage,
    history: ChatMessage[],
    inclusive = true,
    rules = false
  ): ChatMessage[] {
    // Sort history by timestamp to ensure that the index is correct
    history.sort((a: ChatMessage, b: ChatMessage) => {
      return a.timestamp > b.timestamp ? 1 : -1;
    });

    // Get the index of the target message
    const index = history.indexOf(message);

    // If the message is not in the history, return an empty array
    if (index < 0) {
      return [];
    }

    // Get the history up to and including the target message (or not, depending on the inclusive flag)
    let context: ChatMessage[] = history.slice(
      0,
      inclusive ? index + 1 : index
    );

    // Apply Source rules to the context
    if (rules && message.source) {
      context = this.getSourceHistory(message, context, message.source);
    }

    // Apply Project rules to the context
    if (rules && message.project) {
      context = this.getProjectHistory(message, context, message.project);
    }

    return context;
  }

  private getProjectHistory(
    message: ChatMessage,
    history: ChatMessage[],
    project: KcProject
  ): ChatMessage[] {
    return history.filter((msg: ChatMessage) => {
      return msg.project && msg.project.id === project.id;
    });
  }

  private getSourceHistory(
    message: ChatMessage,
    history: ChatMessage[],
    source: KnowledgeSource
  ): ChatMessage[] {
    return history.filter((msg: ChatMessage) => {
      return msg.source && msg.source.id === source.id;
    });
  }

  countTokens(message: string) {
    if (!message) {
      this.tokenCount.next(0);
      return;
    }

    this.http
      .post(this.backendUrl + '/chat/tokens', { text: message })
      .pipe(map((response: any) => response.tokens))
      .subscribe((count: number) => {
        this.tokenCount.next(count);
      });
  }
}
