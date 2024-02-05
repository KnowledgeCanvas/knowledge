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

import { Component, ViewChild } from '@angular/core';
import { ContextMenu } from 'primeng/contextmenu';
import { MenuItem } from 'primeng/api';
import { ProjectService } from '@services/factory-services/project.service';
import { ChatService } from '@services/chat-services/chat.service';
import { ChatViewComponent } from './chat-components/chat.view.component';
import { Observable } from 'rxjs';
import { ChatMessage } from '@app/models/chat.model';

@Component({
  selector: 'app-chat',
  template: `
    <div class="width-constrained flex flex-column w-full h-full">
      <app-chat-view #chatView class="overflow-y-auto h-full"></app-chat-view>
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

  /* The context menu items */
  menuItems: MenuItem[] = [];

  showSources = true;

  messages$: Observable<ChatMessage[]>;

  constructor(private chat: ChatService, private projects: ProjectService) {
    this.messages$ = this.chat.messages$;
    this.projects.currentProject.subscribe((project) => {
      this.chat.setTarget({ project: project });
    });
  }
}
