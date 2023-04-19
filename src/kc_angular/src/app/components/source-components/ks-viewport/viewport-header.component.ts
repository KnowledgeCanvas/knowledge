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

@Component({
  selector: 'ks-lib-viewport-header',
  template: `
    <div class="ks-viewport-header" [ngClass]="customClass">
      <div class="ks-viewport-header-left">
        <div *ngIf="config.showNavButtons">
          <button
            pButton
            [disabled]="!config.canGoBack"
            icon="pi pi-arrow-left"
            class="p-button-text"
            (click)="back()"
            [pTooltip]="backTooltip"
          ></button>

          <button
            pButton
            [disabled]="!config.canGoForward"
            (click)="forward()"
            icon="pi pi-arrow-right"
            class="p-button-text"
            [pTooltip]="forwardTooltip"
          ></button>

          <button
            pButton
            [disabled]="!config.canRefresh"
            (click)="refresh()"
            icon="pi pi-refresh"
            class="p-button-text"
            [pTooltip]="refreshTooltip"
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
          [disabled]="displayTextDisabled"
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
            (click)="copy()"
            [icon]="copyIcon"
            class="p-button-text"
            [pTooltip]="copyTooltip"
            tooltipPosition="left"
          ></button>

          <button
            pButton
            *ngIf="config.showOpenButton"
            (click)="open()"
            icon="pi pi-external-link"
            class="p-button-text"
            [pTooltip]="openTooltip"
            tooltipPosition="left"
          ></button>

          <button
            pButton
            *ngIf="config.showSaveButton"
            [disabled]="!config.canSave"
            (click)="save()"
            [icon]="saveIcon"
            class="p-button-text"
            [pTooltip]="saveTooltip"
            tooltipPosition="left"
          ></button>

          <button
            pButton
            *ngIf="config.showCloseButton"
            [disabled]="!config.canClose"
            (click)="close()"
            icon="pi pi-times"
            class="p-button-text"
            [pTooltip]="closeTooltip"
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
        background-color: var(--surface-100);

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
    `,
  ],
})
export class ViewportHeaderComponent implements OnChanges {
  @Input() config!: BrowserViewHeaderConfig;
  @Output() headerEvents = new EventEmitter<BrowserViewHeaderEvent>();
  customClass = '';

  // Default tooltip strings
  backTooltip = 'Go Back';
  closeTooltip = 'Close';
  copyTooltip = 'Copy to Clipboard';
  forwardTooltip = 'Go Forward';
  refreshTooltip = 'Reload this page';
  saveTooltip = 'Send to Inbox';
  openTooltip = 'Open in...';

  copyIcon = 'pi pi-copy';
  saveIcon = 'pi pi-save';

  // Putting this here for extensibility, but currently we are not supported letting the user type in a random URL (i.e. this is for display only)
  displayTextDisabled = true;

  ngOnChanges(changes: SimpleChanges) {
    const config = changes.config.currentValue;
    if (config.customClass) {
      this.customClass = config.customClass;
    }
  }

  back() {
    this.headerEvents.emit({ backClicked: true });
  }

  close() {
    this.headerEvents.emit({ closeClicked: true });
  }

  copy() {
    this.headerEvents.emit({ copyClicked: true });
    this.copyIcon = 'pi pi-check';
    setTimeout(() => {
      this.copyIcon = 'pi pi-copy';
    }, 2000);
  }

  forward() {
    this.headerEvents.emit({ forwardClicked: true });
  }

  refresh() {
    this.headerEvents.emit({ refreshClicked: true });
  }

  save() {
    this.headerEvents.emit({ saveClicked: true });
    this.saveIcon = 'pi pi-check';
    setTimeout(() => {
      this.saveIcon = 'pi pi-save';
    }, 2000);
  }

  open() {
    this.headerEvents.emit({ openClicked: true });
  }
}
