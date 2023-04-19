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
import { Subscription } from 'rxjs';

@Component({
  selector: 'ks-lib-browser-view',
  template: `
    <ks-lib-viewport-header
      *ngIf="headerConfig"
      [config]="headerConfig"
      (headerEvents)="headerEvents($event)"
    >
    </ks-lib-viewport-header>

    <div class="browser-view" id="browser-view">
      <!--  Electron BrowserView contents will be placed here-->
    </div>
  `,
  styles: [
    `
      .browser-view {
        height: 100%;
        width: 100%;
        background-color: var(--surface-a);
      }
    `,
  ],
})
export class BrowserViewComponent implements OnInit, OnChanges, OnDestroy {
  @Input() kcBrowserViewConfig!: BrowserViewConfig;
  @Output() viewReady = new EventEmitter<boolean>();
  @Output() onIpcResponse = new EventEmitter<IpcMessage>();
  @Output() navEvent = new EventEmitter<BrowserViewNavEvent>();
  @Output() clickEvent = new EventEmitter<BrowserViewClickEvent>();
  @Output() selectEvent = new EventEmitter();
  headerConfig: BrowserViewHeaderConfig | undefined;
  private stateCheckInterval: any;
  private navEventSubscription: Subscription = new Subscription();
  private goBackSubscription: Subscription = new Subscription();
  private goForwardSubscription: Subscription = new Subscription();
  private urlSubscription: Subscription = new Subscription();

  constructor(
    private ipcService: ElectronIpcService,
    private sanitizer: DomSanitizer
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
    };
  }

  ngOnInit(): void {
    this.goBackSubscription =
      this.ipcService.browserViewCanGoBackResult.subscribe((canGoBack) => {
        if (this.headerConfig) this.headerConfig.canGoBack = canGoBack;
      });

    this.goForwardSubscription =
      this.ipcService.browserViewCanGoForwardResult.subscribe(
        (canGoForward) => {
          if (this.headerConfig) this.headerConfig.canGoForward = canGoForward;
        }
      );

    this.urlSubscription =
      this.ipcService.browserViewCurrentUrlResult.subscribe((url) => {
        if (this.headerConfig) this.headerConfig.displayText = url;
      });
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
      this.headerConfig.canClose = kcBrowserViewConfig.isDialog;
      this.headerConfig.canSave = kcBrowserViewConfig.canSave;
    }
  }

  ngOnDestroy() {
    if (this.stateCheckInterval) clearInterval(this.stateCheckInterval);
    this.navEventSubscription.unsubscribe();
    this.goBackSubscription.unsubscribe();
    this.goForwardSubscription.unsubscribe();
    this.urlSubscription.unsubscribe();
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
      x: Math.floor(position.x * zoomFactor),
      y: Math.floor((position.y + 48) * zoomFactor),
      width: Math.ceil(position.width * zoomFactor),
      height: Math.ceil(position.height * zoomFactor),
    };

    this.ipcService.openBrowserView(request).then((response: IpcMessage) => {
      if (response.success) {
        this.viewReady.emit(true);
      }
      this.onIpcResponse.emit(response);
    });

    this.navEventSubscription = this.ipcService.navEvent.subscribe((url) => {
      if (!url || url.trim() === '') {
        return;
      }

      const navEvent: BrowserViewNavEvent = {
        urlChanged: true,
        url: new URL(url),
      };
      this.navEvent.emit(navEvent);
    });
  }

  getBrowserViewDimensions(elementName: string): any {
    const element = document.getElementById(elementName);
    if (element) {
      return element.getBoundingClientRect();
    }
  }

  getBrowserViewState() {
    if (!this.ipcService) {
      console.warn(
        'Unable to get browser view state because IPC service does not exist...'
      );
      return;
    }
    this.ipcService.triggerBrowserViewStateUpdate();
  }

  headerEvents(headerEvent: BrowserViewHeaderEvent) {
    if (headerEvent.refreshClicked) {
      this.ipcService.browserViewRefresh();
    }

    if (headerEvent.backClicked) {
      this.ipcService.browserViewGoBack();
    }

    if (headerEvent.forwardClicked) {
      this.ipcService.browserViewGoForward();
    }

    this.getBrowserViewState();

    this.clickEvent.emit(headerEvent);
  }
}
