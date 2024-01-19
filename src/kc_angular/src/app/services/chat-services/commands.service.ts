/*
 * Copyright (c) 2024 Rob Royce
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

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ChatService } from '@services/chat-services/chat.service';

export interface CommandArgs {
  label: string;
  optional: boolean;
  value?: string;
}

export interface ChatCommand {
  command: string;
  targets: 'Source' | 'Project' | 'Both';
  description: string;
  args: CommandArgs[];
  argParse?: (args: string) => CommandArgs[];
  execute: (args: CommandArgs[]) => void;
}

@Injectable({
  providedIn: 'root',
})
export class ChatCommandService {
  private commands: ChatCommand[] = [
    {
      command: '/analyze',
      description: 'Get statistics and metrics about a Source or Project',
      targets: 'Both',
      args: [],
      execute: (args: CommandArgs[]) => {
        console.log('analyze', args);
      },
    },
    {
      command: '/categorize',
      description: 'Get a list of Projects that this Source would fit into',
      targets: 'Source',
      args: [],
      execute: (args: CommandArgs[]) => {
        console.log('categorize', args);
      },
    },
    {
      command: '/note',
      description: 'Add a note to this Source',
      targets: 'Source',
      args: [
        {
          label: '<note>',
          optional: false,
        },
      ],
      argParse(args: string) {
        console.log('Checking for note args: ', args);
        const tokens = args.trim().split(' ');
        const note = tokens.slice(1).join(' ').trim();
        console.log('note args: ', note);
        return [
          {
            label: '<note>',
            optional: false,
            value: note === '' ? undefined : note,
          },
        ];
      },
      execute: (args: CommandArgs[]) => {
        console.log('note', args);
      },
    },
    {
      command: '/organize',
      description:
        'Get suggestions on how to organize the Sources in this Project based on Topics, keywords, and other attributes',
      targets: 'Project',
      args: [],
      execute: (args: CommandArgs[]) => {
        console.log('organize', args);
      },
    },
    {
      command: '/review',
      description:
        'Get a high-level overview of your Chat history with this Source or Project',
      targets: 'Both',
      args: [],
      execute: (args: CommandArgs[]) => {
        console.log('review', args);
      },
    },
    {
      command: '/search',
      description:
        'Search a Source or Project using Retrieval-augmented Generation (RAG)',
      targets: 'Both',
      argParse: (args: string) => {
        const tokens = args.trim().split(' ');
        const query = tokens.slice(1).join(' ').trim();
        return [
          {
            label: '<query>',
            optional: false,
            value: query === '' ? undefined : query,
          },
        ];
      },
      args: [
        {
          label: '<query>',
          optional: false,
        },
      ],
      execute: (args: CommandArgs[]) => {
        console.log('search: ', args);
      },
    },
    {
      command: '/similar',
      description: 'Find similar Sources to the one you are currently viewing',
      targets: 'Source',
      args: [],
      execute: (args: CommandArgs[]) => {
        console.log('similar', args);
      },
    },
    {
      command: '/structure',
      description:
        'Get suggestions on how to restructure your Project to make it more organized and easier to navigate',
      targets: 'Project',
      args: [],
      execute: (args: CommandArgs[]) => {
        console.log('structure', args);
      },
    },
    {
      command: '/questions',
      description:
        'Get a list of frequently asked questions based on your Chat history',
      targets: 'Both',
      args: [],
      execute: (args: CommandArgs[]) => {
        console.log('suggest', args);
      },
    },
    {
      command: '/summarize',
      description:
        'Summarize the contents of a Source or Project based on content and Chat history',
      targets: 'Both',
      argParse: (args: string) => {
        const tokens = args.trim().split(' ');
        const level = tokens[1] ?? 'brief';
        return [
          {
            label: '[brief|detailed]',
            optional: true,
            value: level,
          },
        ];
      },
      args: [
        {
          label: '[brief|detailed]',
          optional: true,
        },
      ],
      execute: (args: CommandArgs[]) => {
        console.log('summarize for: ', args);
      },
    },
    {
      command: '/topics',
      description:
        'Get a list of the most common Topics in a Source or Project',
      targets: 'Both',
      args: [],
      execute: (args: CommandArgs[]) => {
        console.log('topics for: ', args);
      },
    },
    {
      command: '/tutor',
      description:
        'Decide what to learn next based on your Chat history and goals',
      targets: 'Both',
      args: [],
      execute: (args: CommandArgs[]) => {
        console.log('tutor', args);
      },
    },
    {
      command: '/model',
      description: 'Get information about the current Chat model',
      targets: 'Both',
      args: [],
      execute: (args: CommandArgs[]) => {
        console.log('model', args);
      },
    },
    {
      command: '/quiz',
      description:
        'Take a quiz to test your understanding of a Source or Project',
      targets: 'Both',
      args: [],
      execute: (args: CommandArgs[]) => {
        console.log('quiz', args);
      },
    },
  ];

  private _commands$ = new BehaviorSubject<ChatCommand[]>([]);

  commands$ = this._commands$.asObservable();

  constructor(private chat: ChatService) {
    this.commands.sort((a, b) => a.command.localeCompare(b.command));
  }

  isValid(command: string) {
    return this.commands.some((c) => c.command === command);
  }

  lookup(command: string) {
    return this.commands.find((c) => c.command === command);
  }

  /**
   * Filter the commands list based on the input. Sets the commands$ observable to the filtered list.
   * @param command text to filter commands by
   * @param target filter based on chat target (Source or Project)
   */
  filter(command: string, target: 'Source' | 'Project') {
    if (command.trim() === '') {
      this._commands$.next([]);
      return;
    }

    const next = this.commands.filter(
      (c) =>
        c.command.startsWith(command.trim()) &&
        (c.targets === target || c.targets === 'Both')
    );
    this._commands$.next(next);
  }

  /**
   * Reset the commands list to an empty array
   */
  reset() {
    this._commands$.next([]);
  }

  indexed(commandIndex: number) {
    const commands = this._commands$.value;
    if (commands.length === 0) {
      return undefined;
    }
    return commands[commandIndex];
  }
}
