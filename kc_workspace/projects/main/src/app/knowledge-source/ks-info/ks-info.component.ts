import {Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {KnowledgeSourceModel} from "../../../../../shared/src/models/knowledge.source.model";
import {GoogleSearchItemModel} from "../../../../../shared/src/models/google.search.results.model";
import {WebsiteModel} from "../../../../../shared/src/models/website.model";
import {FileModel} from "../../../../../shared/src/models/file.model";
import {MatAccordion} from "@angular/material/expansion";

@Component({
  selector: 'app-ks-info',
  templateUrl: './ks-info.component.html',
  styleUrls: ['./ks-info.component.scss']
})
export class KsInfoComponent implements OnInit, OnChanges {
  @ViewChild('accordion', {static: true}) Accordion?: MatAccordion
  @Input() knowledgeSource: KnowledgeSourceModel = new KnowledgeSourceModel('', {value: ''}, 'generic');
  info: any[] = [];
  ingestType: string = '';
  googleItem?: GoogleSearchItemModel;
  websiteItem?: WebsiteModel;
  fileItem?: FileModel;

  dateAccessed?: string;
  dateCreated?: string;
  dateModified?: string;
  containsImages?: boolean = false;

  constructor() {
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.knowledgeSource) {
      this.knowledgeSource = changes.knowledgeSource.currentValue;
      this.ingestType = this.knowledgeSource.ingestType;
      this.googleItem = this.knowledgeSource.googleItem;
      this.websiteItem = this.knowledgeSource.websiteItem;
      this.fileItem = this.knowledgeSource.fileItem;
      // TODO: set the containsImages bool after looking for photos from each source
    }
  }

  openAll() {
    this.Accordion?.openAll();
  }

  closeAll() {
    this.Accordion?.closeAll();
  }
}
