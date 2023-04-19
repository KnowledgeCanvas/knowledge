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

import { Component, OnInit, ViewChild } from '@angular/core';
import { DataService } from '@services/user-services/data.service';
import { finalize, take, tap, timeout } from 'rxjs/operators';
import { KsContextMenuService } from '@services/factory-services/ks-context-menu.service';
import { ProjectContextMenuService } from '@services/factory-services/project-context-menu.service';
import { KnowledgeSource } from '../models/knowledge.source.model';
import { KcProject } from '../models/project.model';
import { ContextMenu } from 'primeng/contextmenu';
import { MenuItem } from 'primeng/api';
import { ProjectService } from '@services/factory-services/project.service';
import { ChatService } from '@services/chat-services/chat.service';
import { ProjectChatService } from '@services/chat-services/project-chat.service';
import { ChatCompletionResponseMessage } from 'openai';
import { ChatViewComponent } from './chat-components/chat.component';
import { SourceChatService } from '@services/chat-services/source-chat.service';
import { ChatHistoryService } from '@services/chat-services/chat.history.service';
import { UuidService } from '@services/ipc-services/uuid.service';
import { AgentType, ChatMessage } from '../models/chat.model';

@Component({
  selector: 'app-chat',
  template: `
    <div class="flex flex-column w-full h-full">
      <app-chat-view
        #chatView
        [history]="history"
        [suggestions]="true"
        [loading]="loading"
        (onSubmit)="onSubmit($event)"
        (onDeleteMessage)="onDeleteMessage($event)"
        (onRegenerateMessage)="regenerateMessage($event)"
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
export class ChatComponent implements OnInit {
  /**
   * The context menu for the chat view
   */
  @ViewChild('cm') cm!: ContextMenu;

  /**
   * The chat view component
   */
  @ViewChild('chatView') chatView!: ChatViewComponent;

  /**
   * The chat history
   */
  history: ChatMessage[] = [];

  /**
   * The loading state of the chat, used to show the loading bar
   */
  loading = false;

  /**
   * The knowledge sources for the current project
   */
  sources: KnowledgeSource[] = [];

  /**
   * The current project
   */
  project?: KcProject;

  /**
   * The context menu items
   */
  menuItems: MenuItem[] = [];

  constructor(
    private data: DataService,
    private chat: ChatService,
    private chatHistory: ChatHistoryService,
    private projects: ProjectService,
    private projectChat: ProjectChatService,
    private sourceChat: SourceChatService,
    private sourceMenu: KsContextMenuService,
    private projectMenu: ProjectContextMenuService,
    private uuid: UuidService
  ) {
    // Load project chat history if there is a current project
    this.projects.currentProject
      .pipe(
        tap((project) => {
          this.project = undefined;
          this.history = [];
          this.sources = [];

          if (!project) {
            return;
          }

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

  ngOnInit(): void {}

  /**
   * Save the chat history for the current project and all sources
   */
  saveHistory() {
    if (this.project) {
      const projectHistory = this.history.filter(
        (message) => message.project?.id.value === this.project?.id.value
      );
      this.chat.saveChat(projectHistory, this.project?.id);
    }

    // Save the individual history for all sources
    let sources = this.history.map((message) => message.source);

    // Get unique sources
    sources = sources.filter((source, index) => {
      return sources.indexOf(source) === index;
    });

    for (const source of sources) {
      if (source) {
        const sourceHistory = this.history.filter(
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
    this.history = [];

    if (this.project?.id) {
      const projectChat = this.chat.loadChat(
        this.project.id,
        this.project,
        undefined
      );
      for (const message of projectChat) {
        this.history.push(message);
      }
    }

    // Load the source history
    for (const source of this.sources) {
      const sourceChat = this.chat.loadChat(source.id, undefined, source);
      for (const message of sourceChat) {
        this.history.push(message);
      }
    }

    // Sort history by timestamp
    this.history = this.history.sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );
    this.loading = false;
  }

  /**
   * Create a new chat message and send it to the chat service on submit
   * @param $event The text of the message
   */
  onSubmit($event: string) {
    if (this.project) {
      this.loading = true;

      const message: ChatMessage = {
        id: this.uuid.generate(1)[0].value,
        timestamp: new Date(),
        text: $event,
        sender: AgentType.User,
        recipient: AgentType.Project,
        project: this.project,
      };
      this.history.push(message);

      this.projectChat
        .send(this.project, this.history, $event)
        .pipe(
          timeout(20000),
          take(1),
          tap((response: ChatCompletionResponseMessage) => {
            console.log('Got response: ', response);

            this.history.push({
              id: this.uuid.generate(1)[0].value,
              timestamp: new Date(),
              text: response.content,
              sender: AgentType.Project,
              recipient: AgentType.User,
              project: this.project,
            });

            this.saveHistory();
            this.chatView.scroll();
          }),
          finalize(() => {
            // If the user message was not responded to, remove it from the history
            if (
              this.history[this.history.length - 1].sender !== AgentType.Project
            ) {
              this.history.pop();
            }
            this.loading = false;
          })
        )
        .subscribe();
    } else {
      console.log('Could not find project for updating chat history...');
    }
  }

  /**
   * Delete a message from the history
   * @param $event The message to delete
   */
  onDeleteMessage($event: ChatMessage) {
    if ($event.project) {
      this.history = this.history.filter((message) => message.id !== $event.id);
      this.history = this.history.sort(
        (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
      );
      this.saveHistory();
    } else if ($event.source) {
      // Remove the message from the history
      this.history = this.history.filter((message) => message.id !== $event.id);

      // Get history for the Source
      const sourceHistory = this.history.filter(
        (message) => message.source?.id.value === $event.source?.id.value
      );

      // Save the source history
      this.chat.saveChat(sourceHistory, $event.source?.id);

      this.history = this.history.sort(
        (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
      );
    }
  }

  /**
   * Regenerate a message by sending it and its history to the chat service
   * @param message The message to regenerate
   */
  regenerateMessage(message: ChatMessage) {
    this.loading = true;

    if (!this.project) {
      return;
    }

    /**
     * Use the message index to get the history up to that point
     * Source history should only include messages to/from the same source
     * Project history should include messages from the project and any sources that are part of the project
     */
    const historySlice = this.chatHistory.getHistory(
      message,
      this.history,
      false,
      !message.project
    );

    // Create a new message with the same text as the message that was responded to
    const promptMessage = historySlice[historySlice.length - 1];

    if (message.project) {
      this.projectChat
        .send(message.project, historySlice, promptMessage.text)
        .pipe(
          timeout(20000),
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
          timeout(20000),
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
