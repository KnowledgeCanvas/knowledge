/**
 Copyright 2021 Rob Royce

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';

export interface KcViewportHeaderConfig {
  showOpenButton?: boolean;
  canClose?: boolean,
  canCopy?: boolean,
  canGoBack?: boolean,
  canGoForward?: boolean,
  canRefresh?: boolean,
  canSave?: boolean,
  displayText?: string,
  displayTextReadOnly?: boolean,
  customClass?: string | string[],
  backgroundColor?: string,
  showSaveButton?: boolean,
  showNavButtons?: boolean,
  showActionButtons?: boolean,
  showDisplayText?: boolean,
  showCloseButton?: boolean
}

export interface KcViewportHeaderEvent {
  backClicked?: boolean,
  forwardClicked?: boolean,
  refreshClicked?: boolean,
  closeClicked?: boolean,
  copyClicked?: boolean,
  saveClicked?: boolean,
  openClicked?: boolean
}

@Component({
  selector: 'ks-lib-viewport-header',
  templateUrl: './viewport-header.component.html',
  styleUrls: ['./viewport-header.component.scss']
})
export class ViewportHeaderComponent implements OnInit, OnChanges {
  @Input() config!: KcViewportHeaderConfig;
  @Output() headerEvents = new EventEmitter<KcViewportHeaderEvent>();
  customClass: string = '';

  // Default tooltip strings
  backTooltip: string = "Go Back";
  closeTooltip: string = 'Close';
  copyTooltip: string = 'Copy to Clipboard';
  forwardTooltip: string = 'Go Forward';
  refreshTooltip: string = 'Reload this page';
  saveTooltip: string = 'Add to "Up Next"'
  openTooltip: string = 'Open in...';

  // Putting this here for extensibility, but currently we are not supported letting the user type in a random URL (i.e. this is for display only)
  displayTextDisabled: boolean = true;

  constructor() {
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {
    let config = changes.config.currentValue;
    if (config.customClass) {
      this.customClass = config.customClass;
    }
  }

  back() {
    this.headerEvents.emit({backClicked: true});
  }

  close() {
    this.headerEvents.emit({closeClicked: true});
  }

  copy() {
    this.headerEvents.emit({copyClicked: true});
  }

  forward() {
    this.headerEvents.emit({forwardClicked: true});
  }

  refresh() {
    this.headerEvents.emit({refreshClicked: true});
  }

  save() {
    this.headerEvents.emit({saveClicked: true});
  }

  open() {
    this.headerEvents.emit({openClicked: true});
  }
}
