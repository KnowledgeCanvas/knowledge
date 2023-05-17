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

import { Component, ViewChild } from '@angular/core';
import { DataService } from '@services/user-services/data.service';
import { finalize, map, take, tap } from 'rxjs/operators';
import { KnowledgeSource } from '../models/knowledge.source.model';
import { KcProject } from '../models/project.model';
import { ContextMenu } from 'primeng/contextmenu';
import { MenuItem } from 'primeng/api';
import { ProjectService } from '@services/factory-services/project.service';
import { ChatService } from '@services/chat-services/chat.service';
import { ProjectChat } from '@services/chat-services/project';
import { ChatCompletionResponseMessage } from 'openai';
import { ChatViewComponent } from './chat-components/chat.view.component';
import { SourceChat } from '@services/chat-services/source';
import { AgentType, ChatMessage } from '@app/models/chat.model';
import { SettingsService } from '@services/ipc-services/settings.service';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'app-chat',
  template: `
    <div class="width-constrained flex flex-column w-full h-full">
      <app-chat-view
        #chatView
        *appRecreateView="chatHistory"
        [history]="chatHistory"
        [loading]="loading"
        (submit)="onSubmit($event)"
        (delete)="onDeleteMessage($event)"
        (regenerate)="regenerateMessage($event)"
        class="overflow-y-auto h-full"
      ></app-chat-view>
    </div>
    <p-contextMenu
      #cm
      styleClass="shadow-7"
      [model]="menuItems"
      [baseZIndex]="999999"
      [autoZIndex]="true"
      appendTo="body"
    >
    </p-contextMenu>
  `,
  styles: [``],
})
export class ChatComponent {
  /* The context menu for the chat view */
  @ViewChild('cm') cm!: ContextMenu;

  /* The chat view component */
  @ViewChild('chatView') chatView!: ChatViewComponent;

  /* The chat history */
  chatHistory: ChatMessage[] = [];

  /* The loading state of the chat, used to show the loading bar */
  loading = false;

  /* The knowledge sources for the current project */
  sources: KnowledgeSource[] = [];

  /* The current project */
  project!: KcProject;

  /* The context menu items */
  menuItems: MenuItem[] = [];

  showSources = true;

  constructor(
    private data: DataService,
    private chat: ChatService,
    private projects: ProjectService,
    private projectChat: ProjectChat,
    private settings: SettingsService,
    private sourceChat: SourceChat
  ) {
    combineLatest([
      settings.app.pipe(map((app) => app.chat.display.sourceMessages)),
      projects.currentProject.pipe(
        map((project) => project || new KcProject('', { value: '' }))
      ),
    ])
      .pipe(
        map(([show, project]) => {
          this.showSources = show;
          this.chatHistory = [];
          this.sources = [];
          this.project = project;
          let sources: KnowledgeSource[] = project.knowledgeSource;

          // Get all the sources for the current project and its subprojects
          const subProjects = [...project.subprojects];

          while (subProjects.length > 0) {
            const subProject = subProjects.pop();

            if (subProject) {
              const sub = this.projects.getProject(subProject);
              if (sub) {
                for (const source of sub.knowledgeSource) {
                  sources = [...sources, source];
                }
                for (const sp of sub.subprojects) {
                  subProjects.push(sp);
                }
              }
            }
          }

          this.sources = sources;
          this.loadHistory();
        })
      )
      .subscribe();
  }

  /**
   * Save the chat history for the current project and all sources
   */
  saveHistory() {
    if (this.project) {
      const projectHistory = this.chatHistory.filter(
        (message) => message.project?.id.value === this.project?.id.value
      );
      this.chat.saveChat(projectHistory, this.project?.id);
    }

    // Save the individual history for all sources
    let sources = this.chatHistory.map((message) => message.source);

    // Get unique sources
    sources = sources.filter((source, index) => {
      return sources.indexOf(source) === index;
    });

    for (const source of sources) {
      if (source) {
        const sourceHistory = this.chatHistory.filter(
          (message) => message.source?.id.value === source?.id.value
        );
        this.chat.saveChat(sourceHistory, source.id);
      }
    }
  }

  /**
   * Load the chat history for the current project and all sources
   */
  loadHistory() {
    this.loading = true;
    this.chatHistory = [];

    if (this.project?.id) {
      const projectChat = this.chat.loadChat(
        this.project.id,
        this.project,
        undefined
      );
      for (const message of projectChat) {
        this.chatHistory.push(message);
      }
    }

    // Load the source history
    if (this.showSources) {
      for (const source of this.sources) {
        const sourceChat = this.chat.loadChat(source.id, undefined, source);
        for (const message of sourceChat) {
          this.chatHistory.push(message);
        }
      }
    }

    // Sort history by timestamp
    this.chatHistory = this.chatHistory.sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );
    this.loading = false;
  }

  /**
   * Create a new chat message and send it to the chat service on submit
   * @param $event The text of the message
   */
  onSubmit($event: string) {
    this.loading = true;

    if (this.chatHistory.length === 0) {
      this.chatHistory = [];
    }

    this.chatHistory.push(
      this.chat.createMessage(
        AgentType.User,
        AgentType.Project,
        $event,
        this.project
      )
    );
    this.chatView.scroll();

    this.projectChat
      .send(this.project, this.chatHistory)
      .pipe(
        take(1),
        tap((response: ChatCompletionResponseMessage) => {
          this.chatHistory.push(
            this.chat.createMessage(
              AgentType.Project,
              AgentType.User,
              response.content,
              this.project
            )
          );
          this.saveHistory();
          this.chatView.scroll();
        }),
        finalize(() => {
          // If the user message was not responded to, remove it from the history
          if (
            this.chatHistory[this.chatHistory.length - 1].sender !==
            AgentType.Project
          ) {
            // Remove first element
            this.chatHistory.shift();
          }
          this.loading = false;
        })
      )
      .subscribe();
  }

  /**
   * Delete a message from the history
   * @param messages The message(s) to delete
   */
  onDeleteMessage(messages: ChatMessage[]) {
    // Remove messages from the history and save
    this.chatHistory = this.chatHistory.filter(
      (message) => !messages.includes(message)
    );
  }

  /**
   * Regenerate a message by sending it and its history to the chat service
   * @param message The message to regenerate
   */
  regenerateMessage(message: ChatMessage) {
    if (!this.project) {
      return;
    }

    this.loading = true;

    /**
     * Use the message index to get the history up to that point
     * Source history should only include messages to/from the same source
     * Project history should include messages from the project and any sources that are part of the project
     */
    const historySlice = this.chat.getHistory(
      message,
      this.chatHistory,
      false,
      !message.project
    );

    // Create a new message with the same text as the message that was responded to
    const promptMessage = historySlice[historySlice.length - 1];

    if (message.project) {
      this.projectChat
        .send(message.project, historySlice, promptMessage.text)
        .pipe(
          take(1),
          tap((response: ChatCompletionResponseMessage) => {
            message.text = response.content;
            message.regenerated = true;
            this.saveHistory();
          }),
          finalize(() => {
            this.loading = false;
          })
        )
        .subscribe();
    } else if (message.source) {
      this.sourceChat
        .send(message.source, historySlice, promptMessage.text)
        .pipe(
          take(1),
          tap((response: ChatCompletionResponseMessage) => {
            message.text = response.content;
            message.regenerated = true;
            this.saveHistory();
          }),
          finalize(() => {
            this.loading = false;
          })
        )
        .subscribe();
    }
  }
}
