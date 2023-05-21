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

import { ChatMessage } from '@app/models/chat.model';
import { Clipboard } from '@angular/cdk/clipboard';
import { Injectable } from '@angular/core';
import { KsCommandService } from '@services/command-services/ks-command.service';
import { MarkdownService } from './markdown.service';
import { MenuItem, PrimeIcons } from 'primeng/api';
import { NotificationsService } from '@services/user-services/notifications.service';
import { ProjectCommandService } from '@services/command-services/project-command.service';
import { SearchService } from '@services/user-services/search.service';
import { UuidService } from '@services/ipc-services/uuid.service';

@Injectable({
  providedIn: 'root',
})
export class ChatContextMenuService {
  constructor(
    private uuid: UuidService,
    private clipboard: Clipboard,
    private searchService: SearchService,
    private markdown: MarkdownService,
    private sourceCommand: KsCommandService,
    private projectCommand: ProjectCommandService,
    private notifications: NotificationsService
  ) {}

  continue(command: () => void): MenuItem {
    return {
      label: 'Continue',
      icon: 'pi pi-arrow-right',
      command: command,
    };
  }

  copy(message: ChatMessage): MenuItem {
    return {
      label: 'Copy',
      icon: PrimeIcons.COPY,
      items: [
        {
          label: 'Text',
          command: () => {
            this.clipboard.copy(`${message.text}`);
            this.notifications.success(
              'Chat',
              'Copied',
              'Copied text to clipboard'
            );
          },
        },
        {
          label: 'HTML',
          command: () => {
            this.clipboard.copy(`${this.markdown.parseMarkdown(message.text)}`);
            this.notifications.success(
              'Chat',
              'Copied',
              'Copied HTML to clipboard'
            );
          },
        },
      ],
    };
  }

  edit(afterAction: () => void): MenuItem {
    return {
      label: 'Edit',
      icon: 'pi pi-pencil',
      command: afterAction,
    };
  }

  highlight(
    target: ChatMessage,
    $event: MouseEvent,
    afterAction: () => void
  ): MenuItem | undefined {
    // Check if the user right clicked on an existing highlight. If so, return the remove highlight menu item.
    const ele = $event.target as HTMLElement;
    if (ele.tagName === 'MARK') {
      return this.removeHighlight(target, ele, afterAction);
    }

    // Check if the user has highlighted text. If so, return the highlight menu item.
    const selection = window.getSelection();
    if (!selection || selection.toString().length === 0) {
      return undefined;
    }

    const highlightCommand = (
      colorClass = 'highlight-yellow',
      className: string
    ) => {
      // Iterate over the selected nodes and add the highlight class to the applicable text in each node.
      const textSegments = selection.toString().split('\n');
      for (let segment of textSegments) {
        if (segment.trim().length > 0) {
          // Replace the TLDR and ELI5 tags with bold text. Required because the highlighted text does not include the ** characters.
          segment = segment.replace('TLDR:', '<u>**TLDR:**</u>');
          segment = segment.replace('ELI5:', '<u>**ELI5:**</u>');
          target.text = target.text.replace(
            segment,
            `<mark class="${className} ${colorClass}">${segment}</mark>`
          );
        }
      }
    };

    return {
      label: 'Highlight',
      icon: PrimeIcons.PENCIL,
      items: [
        {
          label:
            '<span class="highlight-selector-yellow">HIGHLIGHTHIGHLIGHT</span>',
          command: () => {
            const className = new Date().toISOString();
            highlightCommand('highlight-yellow', className);
            afterAction();
          },
          escape: false,
        },
        {
          label:
            '<span class="highlight-selector-green">HIGHLIGHTHIGHLIGHT</span>',
          command: () => {
            const className = new Date().toISOString();
            highlightCommand('highlight-green', className);
            afterAction();
          },
          escape: false,
        },
        {
          label:
            '<span class="highlight-selector-red">HIGHLIGHTHIGHLIGHT</span>',
          command: () => {
            const className = new Date().toISOString();
            highlightCommand('highlight-red', className);
            afterAction();
          },
          escape: false,
        },
        {
          label:
            '<span class="highlight-selector-lightblue">HIGHLIGHTHIGHLIGHT</span>',
          command: () => {
            const className = new Date().toISOString();
            highlightCommand('highlight-lightblue', className);
            afterAction();
          },
          escape: false,
        },
      ],
      command: () => {
        const className = new Date().toISOString();
        const text = selection.toString();
        target.text = target.text.replace(
          text,
          `<mark class="${className}">${text}</mark>`
        );
        afterAction();
      },
    };
  }

  removeHighlight(
    target: ChatMessage,
    element: HTMLElement,
    afterAction: () => void
  ): MenuItem {
    return {
      label: 'Remove Highlight',
      icon: PrimeIcons.PENCIL,
      command: () => {
        // Find all elements with the same class name and remove the <mark> tag from all of them.
        const elements = document.getElementsByClassName(element.className);
        for (let i = 0; i < elements.length; i++) {
          // Use regex to remove the <mark> tags
          const regex1 = new RegExp(`<mark class="${element.className}">`);
          const regex2 = new RegExp(`</mark>`);
          target.text = target.text.replace(regex1, '');
          target.text = target.text.replace(regex2, '');
        }
        afterAction();
      },
    };
  }

  search(
    target: ChatMessage,
    selection: Selection,
    afterAction: () => void
  ): MenuItem {
    return {
      label: 'Search',
      icon: PrimeIcons.SEARCH,
      command: () => {
        const searchQuery = selection.toString();
        this.searchService.executeSearch(searchQuery);
        afterAction();
      },
    };
  }

  save(message: ChatMessage) {
    return {
      label: 'Save as Note',
      icon: PrimeIcons.CODE,
      command: () => {
        if (message.source) {
          message.source.description += `

${message.text}`;
        } else if (message.project) {
          message.project.description += `

${message.text}`;
        }
        this.notifications.success(
          'Chat',
          'Saved!',
          `Added to ${message.source ? 'Source Notes' : 'Project Description'}`
        );
      },
    };
  }

  separator() {
    return {
      separator: true,
    };
  }

  regenerate(command: () => void) {
    return {
      label: 'Regenerate',
      icon: 'pi pi-refresh',
      command: command,
    };
  }

  tldr(command: () => void) {
    return {
      label: 'TLDR',
      icon: 'pi pi-book',
      command: command,
    };
  }

  eli5(command: () => void) {
    return {
      label: 'ELI5',
      icon: 'pi pi-info-circle',
      command: command,
    };
  }

  delete(command: () => void) {
    return {
      label: 'Delete',
      icon: PrimeIcons.TRASH,
      command: command,
    };
  }

  topics(message: ChatMessage, topic: string, command: () => void) {
    return {
      label: 'Add to Topics',
      icon: 'pi pi-tags',
      command: () => {
        // topic = topic.toLocaleUpperCase()

        // Replace /, -, _, and . with a space
        topic = topic.replace(/[/\-,._]/g, ' ');

        // Transform the topic to title case
        topic = topic.replace(/\w\S*/g, function (txt) {
          return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });

        // Remove any non alphanumeric characters
        topic = topic.replace(/[^a-zA-Z0-9 ]/g, '');

        if (message.source) {
          if (message.source.topics) {
            message.source.topics.push(topic);
          } else {
            message.source.topics = [topic];
          }
          this.sourceCommand.update([message.source]);
        }

        if (message.project && message.project.id) {
          if (message.project.topics) {
            message.project.topics.push(topic);
          } else {
            message.project.topics = [topic];
          }
          this.projectCommand.update([{ id: message.project.id }]);
        }

        command();
      },
    };
  }
}
