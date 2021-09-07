import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild} from '@angular/core';
import {KnowledgeSource, KnowledgeSourceReference} from "projects/ks-lib/src/lib/models/knowledge.source.model";
import {SearchModel} from "projects/ks-lib/src/lib/models/google.search.results.model";
import {WebsiteModel} from "projects/ks-lib/src/lib/models/website.model";
import {FileModel} from "projects/ks-lib/src/lib/models/file.model";
import {MatAccordion} from "@angular/material/expansion";
import {AuthorModel} from "projects/ks-lib/src/lib/models/author.model";
import {ElectronIpcService} from "../../../../../ks-lib/src/lib/services/electron-ipc/electron-ipc.service";

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
  snippet: string | undefined = undefined;
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
      this.snippet = ks.snippet;
      this.reference = ks.reference;
      this.notes = ks.notes.text;
      this.description = ks.description ? ks.description : '';
      this.authors = ks.authors ? ks.authors : [];
      this.dateAccessed = ks.dateAccessed.toLocaleString();
      this.dateCreated = ks.dateCreated.toLocaleString();
      this.dateModified = ks.dateModified.toLocaleString();
      // TODO: set the containsImages bool after looking for photos from each source

      console.log('Displaying ks: ', ks);
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
