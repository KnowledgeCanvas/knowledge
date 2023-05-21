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

import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { ChatService } from '@services/chat-services/chat.service';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { NotificationsService } from '@services/user-services/notifications.service';

@Component({
  selector: 'chat-input',
  template: `
    <div class="w-full flex flex-column flex-grow-0" id="chat-bar">
      <div class="flex flex-row gap-4 px-4 justify-content-between">
        <div
          *ngFor="let question of questions"
          (click)="ask(question)"
          class="next-question-suggestion cursor-pointer opacity-70 fadein text-center select-none surface-overlay border-round-top-2xl px-3 pt-2 shadow-1 mb-1 min-h-2rem"
          disabled="loading"
          style="min-height: 2rem;"
          [pTooltip]="question"
          tooltipStyleClass="w-30rem max-w-30rem"
          tooltipPosition="top"
          proTip
          tipHeader="Out of Questions? We've Got Your Back!"
          tipMessage="Check out our recommended next questions, thoughtfully crafted by our LLM agents. They're here to kickstart your curiosity and keep the knowledge flowing. So, what's your next question?"
          [tipGroups]="['chat']"
          tipIcon="pi pi-question"
        >
          {{ question | truncate : [84] }}
        </div>
      </div>
      <div class="px-2">
        <div class="w-full">
          <textarea
            #chatInput
            pInputTextarea
            pAutoFocus
            [autofocus]="true"
            (focus)="focus()"
            (keydown.enter)="enter(chatInput.value)"
            (input)="input(chatInput.value)"
            [autoResize]="true"
            [disabled]="loading"
            [rows]="2"
            class="w-full flex-row border-round-2xl shadow-2 max-h-12rem overflow-y-auto"
            id="chat-input"
            placeholder="Type your questions here..."
          ></textarea>
        </div>
        <div class="w-full relative px-3 h-2rem select-none">
          <p-progressBar
            *ngIf="loading; else notLoading"
            [style]="{ height: '2px' }"
            class="w-full px-3 flex-col-between"
            mode="indeterminate"
          ></p-progressBar>
          <ng-template #notLoading class="pl-2 text-500">
            <div
              [class.text-red-500]="
                (tokenCount$ | async)! > (tokenLimit$ | async)!
              "
            >
              {{ tokenCount$ | async }} / {{ tokenLimit$ | async }}
            </div>
          </ng-template>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class ChatInputComponent {
  @ViewChild('chatInput', { static: true }) chatInput!: ElementRef;

  @Input() loading = false;

  @Input() questions: string[] = [];

  @Output() send = new EventEmitter<string>();

  @Output() focusEvent = new EventEmitter<void>();

  tokenCount$: Observable<number>;

  tokenLimit$: Observable<number>;

  private userInput = new BehaviorSubject<string>('');

  private canSend = true;

  constructor(private chat: ChatService, private notify: NotificationsService) {
    this.tokenCount$ = chat.tokenCount$;
    this.tokenLimit$ = chat.tokenLimit$;
    combineLatest([this.tokenCount$, this.tokenLimit$]).subscribe(
      ([count, limit]) => {
        this.canSend = count <= limit;
      }
    );

    this.userInput
      .asObservable()
      .pipe(debounceTime(500))
      .subscribe((value) => {
        this.chat.countTokens(value);
      });
  }

  ask(question: string) {
    this.send.emit(question);
    this.questions = this.questions.filter((q) => q !== question);
  }

  input(value: string) {
    this.userInput.next(value);
  }

  focus() {
    this.focusEvent.emit();
  }

  enter(value: string) {
    if (this.canSend) {
      this.send.emit(value);
      this.chatInput.nativeElement.value = '';
      this.userInput.next('');
    } else {
      this.notify.warn(
        'Chat Input',
        'Uh-oh!',
        'Your message is too long! Please shorten it and try again.',
        'toast'
      );
    }
  }
}
