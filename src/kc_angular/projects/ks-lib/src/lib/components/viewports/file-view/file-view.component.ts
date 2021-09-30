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
import {DomSanitizer, SafeUrl} from "@angular/platform-browser";
import {KcViewportHeaderConfig, KcViewportHeaderEvent} from "../shared/viewport-header/viewport-header.component";

export interface KcFileViewConfig {
  filePath: string,
  isDialog?: true
}

export interface KcFileViewEvents {
}

export interface KcFileViewClickEvent extends KcViewportHeaderEvent {
}

@Component({
  selector: 'ks-lib-file-view',
  templateUrl: './file-view.component.html',
  styleUrls: ['./file-view.component.css']
})
export class FileViewComponent implements OnInit, OnChanges {
  @Input() config!: KcFileViewConfig;
  @Output() viewReady = new EventEmitter<boolean>();
  // @Output() navEvent = new EventEmitter();
  @Output() clickEvent = new EventEmitter<KcFileViewClickEvent>();
  // @Output() selectEvent = new EventEmitter();
  safeUrl: SafeUrl | undefined;
  headerConfig: KcViewportHeaderConfig | undefined;

  constructor(private sanitizer: DomSanitizer) {
  }

  ngOnInit(): void {
    this.headerConfig = {
      canCopy: true,
      canClose: this.config.isDialog,
      displayText: this.config.filePath,
      displayTextReadOnly: true,
      showActionButtons: true,
      showDisplayText: true
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.config.filePath) {
      // TODO: verify that this is safe to do with local files
      this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl('file://' + encodeURI(this.config.filePath));
      this.viewReady.emit(true);
    }
  }

  headerEvents(headerEvent: KcViewportHeaderEvent) {
    this.clickEvent.emit(headerEvent);
  }
}
