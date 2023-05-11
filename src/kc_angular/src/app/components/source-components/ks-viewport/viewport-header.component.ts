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
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import {
  BrowserViewHeaderConfig,
  BrowserViewHeaderEvent,
} from '@shared/models/browser.view.model';
import { Message, PrimeIcons } from 'primeng/api';
import { BehaviorSubject, tap } from 'rxjs';

@Component({
  selector: 'ks-lib-viewport-header',
  template: `
    <p-messages
      [value]="(messages$ | async)!"
      [enableService]="false"
      [closable]="true"
      (valueChange)="messageChange($event)"
    ></p-messages>
    <div class="ks-viewport-header title-bar" *ngIf="!alerting">
      <div class="ks-viewport-header-left">
        <div *ngIf="config.showNavButtons">
          <button
            pButton
            [disabled]="!config.canGoBack"
            [class.text-400]="!config.canGoBack"
            [class.text-base]="config.canGoBack"
            icon="pi pi-arrow-left"
            class="p-button-text"
            (click)="headerEvents.emit({ backClicked: true })"
            pTooltip="Go Back"
          ></button>

          <button
            pButton
            [disabled]="!config.canGoForward"
            [class.text-400]="!config.canGoForward"
            [class.text-base]="config.canGoForward"
            (click)="headerEvents.emit({ forwardClicked: true })"
            icon="pi pi-arrow-right"
            class="p-button-text"
            pTooltip="Go Forward"
          ></button>

          <button
            pButton
            [disabled]="!config.canRefresh"
            [class.text-400]="!config.canRefresh"
            [class.text-base]="config.canRefresh"
            (click)="headerEvents.emit({ refreshClicked: true })"
            icon="pi pi-refresh"
            class="p-button-text"
            pTooltip="Refresh"
          ></button>
        </div>
      </div>

      <div
        *ngIf="config.showDisplayText"
        class="ks-viewport-header-center p-fluid w-full"
      >
        <input
          *ngIf="config.displayText"
          pInputText
          type="text"
          [readOnly]="config.displayTextReadOnly"
          [(ngModel)]="config.displayText"
          class="p-fluid w-full surface-300 text-900"
          disabled
        />
      </div>

      <div class="ks-viewport-header-right">
        <div
          *ngIf="config.showActionButtons"
          class="ks-viewport-header-right-contents"
        >
          <button
            pButton
            [disabled]="!config.canCopy"
            [class.text-400]="!config.canCopy"
            [class.text-base]="config.canCopy"
            (click)="copy()"
            icon="pi pi-copy"
            class="p-button-text"
            pTooltip="Copy to Clipboard"
            tooltipPosition="left"
          ></button>

          <button
            pButton
            *ngIf="config.showInvertButton"
            (click)="headerEvents.emit({ invertClicked: true })"
            icon="pi pi-palette"
            class="p-button-text"
            pTooltip="Invert Colors"
            tooltipPosition="left"
          ></button>

          <button
            pButton
            *ngIf="config.showOpenButton"
            (click)="open()"
            icon="pi pi-external-link"
            class="p-button-text"
            pTooltip="Open in..."
            tooltipPosition="left"
          ></button>

          <button
            pButton
            *ngIf="config.showSaveButton"
            [disabled]="!config.canSave"
            [class.text-400]="!config.canSave"
            [class.text-base]="config.canSave"
            (click)="save()"
            icon="pi pi-inbox"
            class="p-button-text"
            pTooltip="Send to Inbox"
            tooltipPosition="left"
          ></button>

          <button
            pButton
            *ngIf="config.showCloseButton"
            [disabled]="!config.canClose"
            [class.text-400]="!config.canClose"
            [class.text-base]="config.canClose"
            (click)="headerEvents.emit({ closeClicked: true })"
            icon="pi pi-times"
            class="p-button-text"
            pTooltip="Close"
            tooltipPosition="left"
          ></button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .ks-viewport-header {
        display: flex;
        flex-direction: row;
        align-content: center;
        align-items: center;
        justify-content: space-between;
        height: 48px;
        padding: 8px;
        background-color: var(--surface-200);
        border-top-left-radius: 1.5rem !important;
        border-top-right-radius: 1.5rem !important;

        .ks-viewport-header-left {
          max-width: 15rem;
          min-width: 9rem;
          display: flex;
          flex-direction: row;
          flex-wrap: nowrap;
          justify-content: flex-start;
          margin-right: 8px;
        }

        .ks-viewport-header-center {
          display: flex;
          flex-direction: row;
          flex-wrap: nowrap;
          justify-content: center;
          align-items: center;
          align-content: center;
        }

        .ks-viewport-header-right {
          margin-left: 8px;

          .ks-viewport-header-right-contents {
            display: flex;
            flex-direction: row;
            flex-wrap: nowrap;
            justify-content: space-between;
          }
        }
      }

      ::ng-deep .p-message {
        margin: 0 !important;
        border-top-left-radius: 1.5rem !important;
        border-top-right-radius: 1.5rem !important;
        border-bottom-left-radius: 0 !important;
        border-bottom-right-radius: 0 !important;
      }
    `,
  ],
})
export class ViewportHeaderComponent implements OnChanges {
  @Input() config!: BrowserViewHeaderConfig;

  @Input() message?: Message;

  @Output() headerEvents = new EventEmitter<BrowserViewHeaderEvent>();

  alerting = false;

  private _messages = new BehaviorSubject<Message[]>([]);

  messages$ = this._messages.asObservable().pipe(
    tap((messages) => {
      // Logic to ensure alerts are shown for 4 seconds
      if (messages.length > 0) {
        this.alerting = true;

        setTimeout(() => {
          this._messages.next([]);
        }, 4000);
      } else {
        setTimeout(() => {
          this.alerting = false;
        }, 250);
      }
    })
  );

  ngOnChanges(changes: SimpleChanges) {
    if (changes.message && changes.message.currentValue) {
      this._messages.next([changes.message.currentValue]);
    }
  }

  copy() {
    this.success(
      'Copied!',
      'The page URL has been copied to your clipboard',
      PrimeIcons.COPY
    );
    this.headerEvents.emit({ copyClicked: true });
  }

  messageChange(messages: Message[]) {
    if (messages.length === 0) {
      this.alerting = false;
    }
  }

  save() {
    this.success(
      'Imported!',
      'The page has been saved to your inbox',
      PrimeIcons.INBOX
    );
    this.headerEvents.emit({ saveClicked: true });
  }

  open() {
    this.success(
      'Opened!',
      'The page will open in your default browser',
      PrimeIcons.EXTERNAL_LINK
    );
    this.headerEvents.emit({ openClicked: true });
  }

  private success(summary: string, detail: string, icon: string) {
    this._messages.next([
      {
        severity: 'success',
        summary: summary,
        detail: detail,
        icon: icon,
        sticky: true,
      },
    ]);
  }
}
