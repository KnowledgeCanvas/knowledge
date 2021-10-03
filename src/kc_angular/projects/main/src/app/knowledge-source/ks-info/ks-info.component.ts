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

import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild} from '@angular/core';
import {KnowledgeSource, KnowledgeSourceReference} from "projects/ks-lib/src/lib/models/knowledge.source.model";
import {MatAccordion} from "@angular/material/expansion";
import {AuthorModel} from "projects/ks-lib/src/lib/models/author.model";

@Component({
  selector: 'app-ks-info',
  templateUrl: './ks-info.component.html',
  styleUrls: ['./ks-info.component.scss']
})
export class KsInfoComponent implements OnInit, OnChanges {
  @ViewChild('accordion', {static: true}) Accordion?: MatAccordion
  @Input() ks: KnowledgeSource | undefined;
  @Output() ksModified = new EventEmitter<boolean>();
  title: string = '';
  reference?: KnowledgeSourceReference;
  authors: AuthorModel[] = [];
  description: string = '';
  ingestType: string = '';
  info: any[] = [];
  notes: string = '';
  dateAccessed?: string;
  dateCreated?: string;
  dateModified?: string;

  constructor() {

  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {
    let ks: KnowledgeSource = changes.ks.currentValue;
    if (ks) {
      this.title = ks.title;
      this.ingestType = ks.ingestType;
      this.reference = ks.reference;
      this.notes = ks.notes.text;
      this.description = ks.description ? ks.description : '';
      this.authors = ks.authors ? ks.authors : [];
      this.dateAccessed = ks.dateAccessed.toLocaleString();
      this.dateCreated = ks.dateCreated.toLocaleString();
      this.dateModified = ks.dateModified.toLocaleString();
    }
  }

  openAll() {
    this.Accordion?.openAll();
  }

  closeAll() {
    this.Accordion?.closeAll();
  }

  setDescription() {
    if (this.ks) {
      this.ks.description = this.description;
      this.ksModified.emit(true);
    }
  }

  setTitle() {
    if (this.ks) {
      this.ks.title = this.title;
      this.ksModified.emit(true);
    }
  }

  notesModified() {
    if (!this.ks || this.ks.notes.text === this.notes)
      return;

    this.ks.notes.text = this.notes;
    this.ks.notes.dateModified = new Date();
    this.ks.dateModified = new Date();
    this.ksModified.emit(true);
  }
}
