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

import {Injectable} from '@angular/core';
import {KnowledgeSource} from "../../models/knowledge.source.model";
import {KsPreviewComponent, KsPreviewInput} from "../../components/knowledge-source-components/ks-preview/ks-preview.component";
import {DialogService, DynamicDialogRef} from "primeng/dynamicdialog";

export interface BrowserViewDialogConfig {
  ks: KnowledgeSource
}

@Injectable({
  providedIn: 'root'
})
export class BrowserViewDialogService {
  constructor(public dialog: DialogService) {
  }

  open(options: BrowserViewDialogConfig): DynamicDialogRef | undefined {
    if (!this.validateURI(options.ks)) {
      return undefined;
    }

    let ksPreviewInput: KsPreviewInput = {
      ks: options.ks
    }

    return this.dialog.open(KsPreviewComponent, {
      width: '100vw',
      height: '100vh',
      contentStyle: {'padding-left': 0, 'padding-right': 0},
      showHeader: false,
      data: ksPreviewInput
    });
  }

  validateURI(ks: KnowledgeSource) {
    if (ks.ingestType === 'file' && typeof ks.accessLink === 'string') {
      if (ks.accessLink.includes('#')) {
        return false;
      }
    }

    return true;
  }
}
