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
  NgZone,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SecurityContext,
  SimpleChanges,
} from '@angular/core';
import { ElectronIpcService } from '@services/ipc-services/electron-ipc.service';
import {
  BrowserViewRequest,
  IpcMessage,
} from '@shared/models/electron.ipc.model';
import { DomSanitizer } from '@angular/platform-browser';
import {
  BrowserViewClickEvent,
  BrowserViewConfig,
  BrowserViewHeaderConfig,
  BrowserViewHeaderEvent,
  BrowserViewNavEvent,
} from '@shared/models/browser.view.model';
import { skip, Subscription } from 'rxjs';
import { Message } from 'primeng/api';

@Component({
  selector: 'ks-lib-browser-view',
  template: `
    <ks-lib-viewport-header
      *ngIf="headerConfig"
      [config]="headerConfig"
      [message]="message"
      (headerEvents)="headerEvents($event)"
    >
    </ks-lib-viewport-header>

    <div class="browser-view" id="browser-view">
      <!--  Electron BrowserView contents will be placed here-->
    </div>
  `,
  styles: [
    `
      :host {
        overflow: hidden !important;
      }

      ks-lib-viewport-header {
        overflow: hidden !important;
        max-height: 48px !important;
      }

      .browser-view {
        height: 100% !important;
        width: 100% !important;
        max-height: 100% !important;
        max-width: 100% !important;
        background-color: var(--surface-a);
      }
    `,
  ],
})
export class BrowserViewComponent implements OnInit, OnChanges, OnDestroy {
  @Input() kcBrowserViewConfig!: BrowserViewConfig;

  @Output() viewReady = new EventEmitter<boolean>();

  @Output() navEvent = new EventEmitter<BrowserViewNavEvent>();

  @Output() clickEvent = new EventEmitter<BrowserViewClickEvent>();

  @Output() selectEvent = new EventEmitter();

  @Output() textExtraction = new EventEmitter<{
    url: string;
    text: string;
    method: string;
  }>();

  headerConfig: BrowserViewHeaderConfig | undefined;

  @Input() message?: Message;

  private stateCheckInterval: any;

  private navEventSubscription: Subscription = new Subscription();

  private subscriptions: Subscription[] = [];

  constructor(
    private ipc: ElectronIpcService,
    private sanitizer: DomSanitizer,
    private zone: NgZone
  ) {
    this.headerConfig = {
      canClose: true,
      canCopy: true,
      canGoBack: false,
      canGoForward: false,
      canRefresh: true,
      canSave: false,
      displayTextReadOnly: true,
      showSaveButton: true,
      showNavButtons: true,
      showActionButtons: true,
      showDisplayText: true,
      showCloseButton: true,
      showOpenButton: true,
      showInvertButton: true,
    };
  }

  ngOnInit(): void {
    this.subscriptions.push(
      this.ipc.browserViewCanGoBackResult.subscribe((canGoBack) => {
        if (this.headerConfig) this.headerConfig.canGoBack = canGoBack;
      })
    );

    this.subscriptions.push(
      this.ipc.browserViewCanGoForwardResult.subscribe((canGoForward) => {
        if (this.headerConfig) this.headerConfig.canGoForward = canGoForward;
      })
    );

    this.subscriptions.push(
      this.ipc.browserViewCurrentUrlResult.subscribe((url) => {
        if (this.headerConfig) this.headerConfig.displayText = url;
      })
    );

    this.subscriptions.push(
      this.ipc.extractedText.pipe(skip(1)).subscribe((data) => {
        if (data.text.trim() === '') {
          return;
        }

        this.zone.run(() => {
          this.handleBrowserMenuEvent(data);
        });
      })
    );
  }

  handleBrowserMenuEvent(data: { url: string; text: string; method: string }) {
    this.textExtraction.emit(data);
    switch (data.method) {
      case 'extract':
        this.message = {
          severity: 'success',
          summary: 'Extracted',
          detail:
            'The selected text has been extracted and saved in the Source notes.',
          sticky: true,
        };
        break;
      case 'summarize':
        this.message = {
          severity: 'success',
          summary: 'Summarizing',
          detail: 'Check the Chat tab for a summary of the selected text.',
          sticky: true,
        };
        break;
      case 'topics':
        this.message = {
          severity: 'success',
          summary: 'Looking for Topics',
          detail:
            'Check the Chat tab for a list of topics related to the selected text.',
          sticky: true,
        };
        break;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    const kcBrowserViewConfig: BrowserViewConfig =
      changes.kcBrowserViewConfig.currentValue;

    // Only load browser view once (on first change, i.e. when the input first arrives)
    if (changes.kcBrowserViewConfig.isFirstChange()) {
      if (!this.headerConfig) {
        console.warn('Could not load browser view: header config undefined...');
        return;
      }

      this.loadBrowserView();
    }

    if (kcBrowserViewConfig && this.headerConfig) {
      this.headerConfig.displayText = kcBrowserViewConfig.url.href;
      this.headerConfig.canClose = this.headerConfig.showCloseButton =
        kcBrowserViewConfig.isDialog;
      this.headerConfig.canSave = kcBrowserViewConfig.canSave;
    }
  }

  ngOnDestroy() {
    if (this.stateCheckInterval) clearInterval(this.stateCheckInterval);
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  loadBrowserView() {
    const sanitizedUrl = this.sanitizer.sanitize(
      SecurityContext.URL,
      this.kcBrowserViewConfig.url.href
    );
    if (!sanitizedUrl) {
      console.error('Unable to load resource with invalid URL...');
      return;
    }

    const zoomFactor = window.outerWidth / window.innerWidth;
    const position = this.getBrowserViewDimensions('browser-view');
    const request: BrowserViewRequest = {
      url: sanitizedUrl,
      x: Math.ceil(position.x * zoomFactor),
      y: Math.ceil((position.y + 48) * zoomFactor),
      width: Math.floor(position.width * zoomFactor) - 1,
      height: Math.floor(position.height * zoomFactor),
    };

    this.ipc.openBrowserView(request).then((response: IpcMessage) => {
      if (response.success) {
        this.viewReady.emit(true);
      }
    });

    this.subscriptions.push(
      this.ipc.navEvent.subscribe((url) => {
        if (!url || url.trim() === '') {
          return;
        }

        const navEvent: BrowserViewNavEvent = {
          urlChanged: true,
          url: new URL(url),
        };
        this.navEvent.emit(navEvent);
      })
    );
  }

  getBrowserViewDimensions(elementName: string): any {
    const element = document.getElementById(elementName);
    if (element) {
      return element.getBoundingClientRect();
    }
  }

  getBrowserViewState() {
    if (!this.ipc) {
      console.warn(
        'Unable to get browser view state because IPC service does not exist...'
      );
      return;
    }
    this.ipc.triggerBrowserViewStateUpdate();
  }

  headerEvents(headerEvent: BrowserViewHeaderEvent) {
    if (headerEvent.refreshClicked) {
      this.ipc.browserViewRefresh();
    }

    if (headerEvent.backClicked) {
      this.ipc.browserViewGoBack();
    }

    if (headerEvent.forwardClicked) {
      this.ipc.browserViewGoForward();
    }

    if (headerEvent.invertClicked) {
      this.ipc.browserViewInvert();
    }

    this.getBrowserViewState();

    this.clickEvent.emit(headerEvent);
  }
}
