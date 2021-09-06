import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
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
  websiteItem?: WebsiteModel;
  googleItem?: SearchModel;
  description: string = '';
  snippet: string = '';
  ingestType: string = '';
  fileItem?: FileModel;
  info: any[] = [];

  containsImages?: boolean = false;
  dateAccessed?: string;
  dateCreated?: string;
  dateModified?: string;

  constructor(private ipcService: ElectronIpcService, private ref: ChangeDetectorRef) {

  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {
    let ks = changes.ks.currentValue;
    if (ks) {
      this.title = ks.title;
      this.ingestType = ks.ingestType;
      this.googleItem = ks.googleItem;
      this.websiteItem = ks.websiteItem;
      this.snippet = ks.snippet;
      this.fileItem = ks.fileItem;
      this.reference = ks.reference;
      this.description = ks.description;
      this.authors = ks.authors;
      this.dateAccessed = ks.dateAccessed;
      this.dateCreated = ks.dateCreated;
      this.dateModified = ks.dateModified;
      // TODO: set the containsImages bool after looking for photos from each source
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
}
