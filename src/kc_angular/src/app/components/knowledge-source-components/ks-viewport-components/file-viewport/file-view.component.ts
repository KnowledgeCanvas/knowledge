/**
 Copyright 2022 Rob Royce

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
import {KcViewportHeaderConfig, KcViewportHeaderEvent} from "../viewport-header/viewport-header.component";

export interface KcFileViewConfig {
  filePath: string,
  isDialog?: true
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
  @Input() showHeader: boolean = false;
  @Output() viewReady = new EventEmitter<boolean>();
  @Output() clickEvent = new EventEmitter<KcFileViewClickEvent>();
  @Output() fileError = new EventEmitter<string>();
  safeUrl: SafeUrl | undefined;
  headerConfig: KcViewportHeaderConfig | undefined;
  ready: boolean = false;


  constructor(private sanitizer: DomSanitizer) {
  }

  ngOnInit(): void {


    this.headerConfig = {
      canCopy: true,
      canClose: this.config.isDialog,
      displayText: this.config.filePath,
      displayTextReadOnly: true,
      showActionButtons: true,
      showDisplayText: true,
      showCloseButton: true,
      showOpenButton: true
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    const config: KcFileViewConfig = changes.config.currentValue;
    // TODO: sanitize file paths to avoid errors (e.g. with # symbol in file path) [should be done when we import files...]
    if (config) {
      if (config.filePath) {
        if (this.validateFileURI(config.filePath)) {
          this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl('file://' + encodeURI(config.filePath));
          this.ready = true;
          this.viewReady.emit(true);
        } else {
          this.fileError.emit('The file path contains invalid characters and cannot be previewed.');
        }
      }
    }
  }

  headerEvents(headerEvent: KcViewportHeaderEvent) {
    this.clickEvent.emit(headerEvent);
  }

  validateFileURI(uri: string) {
    return !uri.includes('#');
  }
}
