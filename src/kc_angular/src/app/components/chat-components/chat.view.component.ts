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

import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { ChatService } from '@app/services/chat-services/chat.service';
import { debounceTime, finalize, map, take, tap } from 'rxjs/operators';
import { ConfirmationService, MenuItem, PrimeIcons } from 'primeng/api';
import { ContextMenu } from 'primeng/contextmenu';
import {
  KcNotification,
  NotificationsService,
} from '@app/services/user-services/notifications.service';
import { ChatContextMenuService } from '@app/services/factory-services/chat-context-menu.service';
import { AgentType, ChatMessage } from '@app/models/chat.model';
import { ChatPrompts } from '@services/chat-services/prompts';
import { SettingsService } from '@services/ipc-services/settings.service';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';

@Component({
  selector: 'app-chat-view',
  templateUrl: './chat.view.component.html',
  styleUrls: ['./chat.view.component.scss'],
})
export class ChatViewComponent implements OnInit, OnChanges {
  /* The input element for the chat */
  @ViewChild('chatInput', { static: true }) chatInput!: ElementRef;

  /* The context menu for chat messages */
  @ViewChild('cm', { static: true }) cm!: ContextMenu;

  /* The chat history to display */
  @Input() history: ChatMessage[] = [];

  /* Whether the chat is loading (e.g. waiting for a response from the server) */
  @Input() loading = false;

  /* Whether to apply a height restriction to the chat history */
  @Input() heightRestricted = false;

  /* Special handling for target-specific functionality required */
  @Input() target: 'Source' | 'Project' = 'Source';

  /* The event emitted when the user submits a message */
  @Output() submit: EventEmitter<string> = new EventEmitter<string>();

  /* The event emitted when the user clicks on the Regenerate button */
  @Output() regenerate: EventEmitter<ChatMessage> =
    new EventEmitter<ChatMessage>();

  /* The event emitted when the user clicks on the Delete button */
  @Output() delete: EventEmitter<ChatMessage[]> = new EventEmitter<
    ChatMessage[]
  >();

  /* An array of suggestions for the next question */
  nextQuestionSuggestions: string[] = [];

  /* The context menu used to display the options for a message */
  messageMenu: MenuItem[] = [];

  suggestions = true;

  focusTrap = true;

  editedMessage?: ChatMessage;

  filtered$: Observable<ChatMessage[]>;

  private _history$ = new BehaviorSubject<ChatMessage[]>([]);

  history$ = this._history$.asObservable();

  private filter = new BehaviorSubject<string>('');

  filter$ = this.filter.asObservable();

  private messageInput = new BehaviorSubject<string>('');

  constructor(
    private chat: ChatService,
    private context: ChatContextMenuService,
    private confirm: ConfirmationService,
    private notify: NotificationsService,
    private prompts: ChatPrompts,
    private settings: SettingsService
  ) {
    settings.all
      .pipe(
        map((settings) => settings.app.chat.suggestions),
        debounceTime(250),
        tap((suggestions) => {
          this.suggestions = suggestions.enabled;
          this.focusTrap = suggestions.onInput;
        })
      )
      .subscribe();

    this.history$.pipe(debounceTime(100)).subscribe((history) => {
      if (history.length === 0) {
        // Add an introductory message to the chat history
        const msg = this.chat.createMessage(
          AgentType.Knowledge,
          AgentType.User,
          "Welcome to Knowledge Chat! I'm here to help you with any questions or research needs you may have. Whether you need help with a project or just want to learn more about a topic, I'm here to assist you. Please feel free to ask me anything!"
        );
        this._history$.next([msg]);
      }
    });

    // Filter the chat history based on the filter text
    this.filtered$ = combineLatest([this.filter$, this.history$]).pipe(
      debounceTime(100),
      map(([filter, history]) => {
        if (!filter) return history;

        return history.filter((message) => {
          return message.text.toLowerCase().includes(filter.toLowerCase());
        });
      })
    );

    this.messageInput
      .asObservable()
      .pipe(debounceTime(1000))
      .subscribe((message) => {
        this.chat.countTokens(message);
      });
  }

  ngOnInit(): void {
    // Scroll to the bottom of the chat history after rest of component finishes loading
    setTimeout(() => {
      this.scroll();
    }, 50);
  }

  /**
   * If the history changes, reset the suggestions and sort the history by timestamp
   * If the suggestions are enabled, use the most recent message to generate suggestions
   */
  ngOnChanges(changes: SimpleChanges) {
    if (changes.history) {
      // Reset the suggestions when the history changes
      this.nextQuestionSuggestions = [];
      this.filter.next('');
      this._history$.next(changes.history.currentValue);

      setTimeout(() => {
        if (
          changes.history?.currentValue?.length ===
          changes.history?.previousValue?.length - 1
        ) {
          return;
        }
        this.scroll();
      }, 1000);
    }
  }

  /* Scroll to the end of the #chat-history element */
  scroll() {
    const classElement = document.getElementsByClassName(
      'chat-history-scroll-target'
    );
    if (classElement.length > 0) {
      setTimeout(() => {
        classElement[0].scrollIntoView({ behavior: 'smooth' });
      }, 250);
    }
  }

  sendMessage(message: string) {
    if (!message) {
      return;
    }

    this.submit.emit(message);
    this.chat.countTokens('');
    this.scroll();
  }

  /**
   * Generate the next question suggestions for the given message
   *
   * @param message The message to generate suggestions for
   * @description The suggestions are generated using the message and the 14 messages prior to it
   */
  generateNextQuestion(message: ChatMessage) {
    if (!this.settings.get().app.chat.suggestions.enabled) {
      return;
    }

    // Get the message and the 14 messages prior to it, then send those to the prompt service
    this.chat.getHistory(message, this.history, true);
    const index = this.history.indexOf(message);
    const messages = this.history.slice(index - 14, index + 1);

    this.prompts
      .predictNextQuestion(messages, message.source ? 'source' : 'project')
      .pipe(
        take(1),
        tap((response) => {
          this.nextQuestionSuggestions = response;
          this.scroll();
        })
      )
      .subscribe();
  }

  chatFocusTrap() {
    if (this.suggestions && this.focusTrap) {
      this.generateNextQuestion(this.history[this.history.length - 1]);
    }
  }

  /* Submit the given suggestion as the next question */
  sendSuggestion(suggestion: string) {
    if (this.loading) {
      return;
    }
    this.submit.emit(suggestion);
    this.nextQuestionSuggestions = this.nextQuestionSuggestions.filter(
      (s) => s !== suggestion
    );

    if (this.nextQuestionSuggestions.length === 0) {
      this.generateNextQuestion(this.history[this.history.length - 1]);
    }
  }

  /**
   * Regenerate the given message, replacing it with a new message
   * @param message The message to regenerate
   * @param warn Whether to warn the user that the message will be replaced in the chat history
   * @description This will replace the message in the chat history with a new message
   */
  regenerateMessage(message: ChatMessage, warn = true) {
    if (warn) {
      this.warnUser(
        [message],
        `Regenerate`,
        `Are you sure you want to regenerate this message? This will replace the message in the chat history.`,
        `Regenerate Message`,
        this.regenerate
      );
    } else {
      this.regenerate.emit(message);
    }
  }

  /**
   * Delete the given message from the chat history and storage
   * @param message The message to delete
   * @description This will delete the message from the chat history and storage
   */
  deleteMessage(message: ChatMessage) {
    this.warnUser(
      [message],
      `Delete`,
      `Are you sure you want to permanently delete this message?`,
      `Delete Message`,
      this.delete
    );
  }

  /**
   * Edit the given message in the chat history
   * @param message The message to edit
   * @param edited (optional) The edited message to replace the original message with
   * @description This will replace the message in the chat history with the edited message.
   * If no edited message is given, the message will turn into an input field. If an edited message is given,
   * the message will be replaced with the edited message and the response will be regenerated.
   */
  editMessage(message: ChatMessage, edited?: string) {
    if (edited && edited !== message.text) {
      message.text = edited;

      // If this is a user message, regenerate the response to the message
      if (message.sender === AgentType.User) {
        // Get the message that was a response to the message being edited and regenerate it
        const index = this.history.indexOf(message);
        if (index + 1 <= this.history.length) {
          const response = this.history[index + 1];

          if (response.sender === message.recipient) {
            // If the next message is from the same agent, regenerate the message
            this.regenerateMessage(response, false);
          } else {
            // Otherwise, we need to insert a new response into the history immediately after the edited message
            const newResponse = this.chat.createMessage(
              message.recipient,
              AgentType.User,
              '',
              message.project,
              message.source
            );
            this.history.splice(index + 1, 0, newResponse);
            this.regenerateMessage(newResponse, false);
          }
        }
      }
    }
    this.editedMessage = edited ? undefined : message;
  }

  /**
   * Summarize the given message using the chat service
   * @param message The message to summarize
   * @description This will add a tldr section to the top of the message
   */
  tldr(message: ChatMessage) {
    // Get most recent messages leading up to the message to summarize
    const index = this.history.indexOf(message);
    const messages = this.history.slice(index - 14, index + 1);

    this.loading = true;
    this.chat
      .elaborate(messages, 'TLDR')
      .pipe(
        take(1),
        tap((response) => {
          message.text += `

**TLDR:** ${response.content}`;
          this.chat.saveChat(this.history);
        }),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe();
  }

  /**
   * Explain the given message to a 5-year-old
   * @param message The message to explain
   * @description This will append the ELI5 explaination to the bottom of the message
   */
  explainLikeIm5(message: ChatMessage) {
    // Get most recent messages leading up to the message to explain
    this.loading = true;
    const index = this.history.indexOf(message);
    const messages = this.history.slice(index - 14, index + 1);
    this.chat
      .elaborate(messages, 'ELI5')
      .pipe(
        take(1),
        tap((response) => {
          message.text += `

**ELI5:** ${response.content}`;
          this.chat.saveChat(this.history);
        }),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe();
  }

  /**
   * Continue the response to the given message (useful when the response is too long to fit in one message)
   * @param message
   */
  continueResponse(message: ChatMessage) {
    // Get most recent messages leading up to the message to explain
    this.loading = true;
    const index = this.history.indexOf(message);
    const messages = this.history.slice(index - 14, index + 1);
    this.chat
      .elaborate(messages, 'Continue')
      .pipe(
        take(1),
        tap((response) => {
          message.text += `${response.content}`;
          this.chat.saveChat(this.history);
        }),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe();
  }

  /**
   * Filter the chat history by the given string
   * @param $event The string to filter by
   */
  onFilter($event: string) {
    this.filter.next($event);
  }

  /**
   * Show the context menu for the given message at the given event location
   * @param $event The event to show the context menu at
   * @param message The message to show the context menu for
   */
  showContextMenu($event: MouseEvent, message: ChatMessage) {
    // Set the menu items based on the type of message and its contents
    this.messageMenu = [];

    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      // If the selection is 1-3 words, add the option to save as a topic
      const text = selection.toString().trim();
      const tokens = text.split(' ');
      if (text.length > 0 && tokens.length > 0 && tokens.length <= 5) {
        this.messageMenu.push(
          this.context.topics(message, text, () => {
            this.chat.saveChat(this.history);
          })
        );
      }
      // Add the search option
      this.messageMenu.push(
        this.context.search(message, selection, () => {
          this.chat.saveChat(this.history);
        })
      );
    }

    // If the user has highlighted text, add a highlight option
    const highlight = this.context.highlight(message, $event, () => {
      this.chat.saveChat(this.history);
    });
    if (highlight) {
      this.messageMenu.push(highlight);
    }

    // If the user has selected text or highlighted text, add a separator
    if (this.messageMenu.length > 0) {
      this.messageMenu.push(this.context.separator());
    }

    // If the message is not a user message, and has a source or project, add a save option
    if (
      message.sender !== AgentType.User &&
      (message.source || message.project)
    ) {
      this.messageMenu.push(this.context.save(message));
    }

    this.messageMenu.push(this.context.copy(message));
    this.messageMenu.push(
      this.context.edit(() => {
        this.editMessage(message);
      })
    );

    // If the message is not a user message, add continue, regenerate, tldr, and eli5 options
    if (message.sender !== AgentType.User) {
      this.messageMenu.push(this.context.separator());
      this.messageMenu.push(
        this.context.continue(() => {
          this.continueResponse(message);
        })
      );
      this.messageMenu.push(
        this.context.regenerate(() => {
          this.regenerateMessage(message);
        })
      );
      this.messageMenu.push(
        this.context.tldr(() => {
          this.tldr(message);
        })
      );
      this.messageMenu.push(
        this.context.eli5(() => {
          this.explainLikeIm5(message);
        })
      );
    }

    this.messageMenu.push(this.context.separator());
    this.messageMenu.push(
      this.context.delete(() => {
        this.deleteMessage(message);
      })
    );

    this.cm.show($event);
  }

  rating(rating: 'thumbs-up' | 'thumbs-down' | 'none', message: ChatMessage) {
    message.rating = rating;

    this.notify.debug('Chat View', rating.toLocaleUpperCase(), message);
    this.chat.saveChat(this._history$.value);

    if (rating === 'none') {
      return;
    }

    const msg: KcNotification = {
      severity: rating === 'thumbs-up' ? 'success' : 'warn',
      icon:
        rating === 'thumbs-up' ? PrimeIcons.THUMBS_UP : PrimeIcons.THUMBS_DOWN,
      summary: rating === 'thumbs-up' ? 'Context++' : 'Context--',
      detail:
        rating === 'thumbs-up'
          ? `This message will be prioritized for providing context.`
          : `This message will not be used to provide context.`,
      closable: true,
      presentation: 'toast',
    };
    this.notify.broadcast(msg);
  }

  /**
   * Warn the user that the given action will replace the message in the chat history
   * @param messages The message(s) to regenerate or delete
   * @param acceptLabel The label for the accept button
   * @param confirmation The confirmation message to display to the user
   * @param header The header to display to the user
   * @param emitter The emitter to emit the message to when the user confirms the action
   */
  private warnUser(
    messages: ChatMessage[],
    acceptLabel: string,
    confirmation: string,
    header: string,
    emitter: EventEmitter<any>
  ) {
    this.confirm.confirm({
      message: confirmation,
      icon: `pi pi-exclamation-triangle`,
      header: header,
      accept: () => {
        emitter.emit(messages);
      },
      acceptLabel: acceptLabel,
      acceptIcon: `pi pi-check`,
      rejectIcon: `pi pi-times`,
      acceptButtonStyleClass: `p-button-danger`,
      rejectButtonStyleClass: `p-button-secondary`,
    });
  }

  onClear() {
    this.confirm.confirm({
      message: 'Are you sure you want to clear the chat history?',
      icon: `pi pi-exclamation-triangle`,
      header: 'Clear Chat History',
      accept: () => {
        this.delete.emit(this.history);
      },
      acceptLabel: 'Clear',
      acceptIcon: `pi pi-check`,
      rejectIcon: `pi pi-times`,
      acceptButtonStyleClass: `p-button-danger`,
      rejectButtonStyleClass: `p-button-secondary`,
    });
  }

  countTokens(value: string) {
    this.messageInput.next(value);
  }

  blurHistory($event: boolean) {
    // If the command bar is active, make the chat history slightly opaque and transparent
    if ($event) {
      document
        .getElementsByClassName('chat-history')[0]
        .classList.add('chat-history-active');
    } else {
      document
        .getElementsByClassName('chat-history')[0]
        .classList.remove('chat-history-active');
    }
  }
}
