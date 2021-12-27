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

import {Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild} from '@angular/core';
import {KnowledgeSource} from "projects/ks-lib/src/lib/models/knowledge.source.model";
import {MatDialog} from "@angular/material/dialog";

@Component({
  selector: 'app-ks-info',
  templateUrl: './ks-info.component.html',
  styleUrls: ['./ks-info.component.scss']
})
export class KsInfoComponent implements OnInit, OnChanges, OnDestroy {
  @Input() ks!: KnowledgeSource;

  @Output() ksModified = new EventEmitter<boolean>();

  @ViewChild('ksExtraction') ksExtraction!: ElementRef;

  @ViewChild('ksNotes') ksNotes!: ElementRef;

  events: any[] = [];

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


      this.events.push({
        status: 'Created/Imported',
        date: this.ks.dateCreated
      });

      for (let mod of this.ks.dateModified) {
        this.events.push({
          status: 'Modified',
          date: mod
        });
      }

      for (let access of this.ks.dateAccessed) {
        this.events.push({
          status: 'Accessed',
          date: access
        });
      }

      this.events.sort((a, b) => {
        a = new Date(a.date);
        b = new Date(b.date);
        if (a < b)
          return -1;
        if (a > b)
          return 1;
        return 0;
      });

      if (ks.rawText) {
        setTimeout(() => {
          this.ksExtraction.nativeElement.innerHTML = ks.rawText;
        })
      }
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

    return (this.ksUnmodified.title !== ks.title)
      || (this.ksUnmodified.description !== ks.description)
      || (this.ksUnmodified.note && ks.note && this.ksUnmodified.note.text !== ks.note.text);
  }

  ksDeepCopy(ks: KnowledgeSource): KnowledgeSource {
    // A simple, naive, and probably inefficient method for deep-copying an object in JavaScript
    let deepKs: KnowledgeSource = JSON.parse(JSON.stringify(ks));

    // After performing a "deep copy", the dates will be in an incorrect format, so we must reconstruct them
    let modified = [];
    let accessed = [];
    for (let d of deepKs.dateModified) {
      modified.push(new Date(d));
    }
    for (let d of deepKs.dateAccessed) {
      accessed.push(new Date(d));
    }
    deepKs.dateModified = modified;
    deepKs.dateAccessed = accessed;
    deepKs.dateCreated = new Date(deepKs.dateCreated);
    return deepKs;
  }

  viewExtractedText() {

  }
}
