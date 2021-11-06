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

import {Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges} from '@angular/core';
import {KnowledgeSource} from "projects/ks-lib/src/lib/models/knowledge.source.model";

@Component({
  selector: 'app-ks-info',
  templateUrl: './ks-info.component.html',
  styleUrls: ['./ks-info.component.scss']
})
export class KsInfoComponent implements OnInit, OnChanges, OnDestroy {
  @Input()
  ks!: KnowledgeSource;

  @Output()
  ksModified = new EventEmitter<boolean>();

  private ksUnmodified?: KnowledgeSource;

  constructor() {
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    // If ks has been changed, notify subscribers
    if (this.ksUnmodified && this.ksHasChanged(this.ks))
      this.ksModified.emit(true);
  }

  ngOnChanges(changes: SimpleChanges) {
    let ks: KnowledgeSource = changes.ks.currentValue;
    if (ks) {
      // If ks changes (reuse of component), check if previous ks changed before updating
      if (this.ksUnmodified && ks.id.value !== this.ksUnmodified.id.value) {
        this.ksEmitIfChanged(changes.ks.previousValue);
      }
      this.ksUnmodified = this.ksDeepCopy(ks);
    }
  }

  ksSaveChanges(ks: KnowledgeSource) {
    this.ksEmitIfChanged(ks);
    this.ksUnmodified = this.ksDeepCopy(ks);
  }

  ksEmitIfChanged(ks?: KnowledgeSource) {
    if (ks && this.ksHasChanged(ks)) {
      this.ksModified.emit(true);
    } else if (this.ksHasChanged(this.ks)) {
      this.ksModified.emit(true);
    }
  }

  ksHasChanged(ks: KnowledgeSource): boolean {
    if (!this.ksUnmodified) {
      return true;
    }
    if (!ks.title || ks.title.trim() === '') {
      ks.title = this.ksUnmodified.title;
      return false;
    }

    let notes = '';
    this.ksUnmodified.notes.forEach((ks) => {
      notes += ks.text;
    });

    let newNotes = '';
    ks.notes.forEach((ks) => {
      newNotes += ks.text;
    });

    return (this.ksUnmodified.title !== ks.title)
      || (this.ksUnmodified.description !== ks.description)
      || (notes !== newNotes);
  }

  ksDeepCopy(ks: KnowledgeSource): KnowledgeSource {
    let deepKs: KnowledgeSource = JSON.parse(JSON.stringify(ks));
    deepKs.dateModified = new Date(deepKs.dateModified);
    deepKs.dateAccessed = new Date(deepKs.dateAccessed);
    deepKs.dateCreated = new Date(deepKs.dateCreated);
    return deepKs;
  }
}
