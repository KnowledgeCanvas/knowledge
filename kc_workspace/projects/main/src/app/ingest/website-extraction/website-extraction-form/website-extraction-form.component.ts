import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {ExtractionService} from "../../../extraction/extraction.service";
import {WebsiteMetadataModel} from "../../../../../../shared/src/models/website.model";
import {MatDialogRef} from "@angular/material/dialog";
import {KnowledgeSourceModel} from "../../../../../../shared/src/models/knowledge.source.model";
import {UuidModel} from "../../../../../../shared/src/models/uuid.model";
import {TopicModel} from "../../../../../../shared/src/models/topic.model";
import {UuidService} from "../../../../../../shared/src/services/uuid/uuid.service";
import {ProjectService} from "../../../../../../shared/src/services/projects/project.service";
import {FaviconExtractorService} from "../../../../../../shared/src/services/favicon/favicon-extractor.service";

@Component({
  selector: 'app-website-extraction-form',
  templateUrl: './website-extraction-form.component.html',
  styleUrls: ['./website-extraction-form.component.scss']
})
export class WebsiteExtractionFormComponent implements OnInit {
  url: string = '';
  @Output() outKS = new EventEmitter<KnowledgeSourceModel>();
  parentId: UuidModel;
  websiteKS: KnowledgeSourceModel;
  panelOpenState = false;
  validUrl: boolean = false;
  title: string = '';
  topics: string[] = [];
  icon: any;
  validating: boolean = false;

  constructor(private dialogRef: MatDialogRef<any>,
              private extractionService: ExtractionService,
              private uuidService: UuidService,
              private projectService: ProjectService,
              private faviconService: FaviconExtractorService) {

    this.parentId = projectService.getCurrentProjectId();
    let uuid = this.uuidService.generate(1);
    console.log('ID Generated for website extractiON: ', uuid);
    this.websiteKS = new KnowledgeSourceModel('', uuid[0], 'website');
  }

  ngOnInit(): void {
  }

  checkUrl() {
    this.validating = true;
    this.extractionService.extractWebsiteMetadata(this.url).then((metadata: WebsiteMetadataModel) => {
      this.title = metadata.title ? metadata.title : '';
      if (this.websiteKS) {
        this.websiteKS.icon = metadata.icon ? metadata.icon : this.faviconService.generic();
        this.websiteKS.iconUrl = this.faviconService.generic();
      }
      this.validating = false;
      this.validUrl = true;
    }).catch((error) => {
      console.error('Unable to extract metadata from ', this.url);
      console.error(error);
    });
  }

  cancel() {
    this.dialogRef.close();
  }

  extract() {
    this.emplaceIds();
    this.emplaceMetadata();
    this.emitKnowledgeSource();
  }

  emplaceIds() {
    this.websiteKS.topics = [];
    if (this.topics.length > 0) {
      for (let i = 0; i < this.topics.length; i++) {
        this.websiteKS.topics.push(this.topics[i]);
      }

    }
  }

  emplaceMetadata() {
    let url = new URL(this.url);
    this.websiteKS.title = this.title;
    this.websiteKS.associatedProjects = [this.parentId];
    this.websiteKS.sourceRef = 'extract';
    this.websiteKS.iconUrl = url.hostname;
    this.websiteKS.websiteItem = {
      url: this.url,
      dateExtracted: Date()
    }
  }

  emitKnowledgeSource() {
    console.log('Emitting KS: ', this.websiteKS);
    this.outKS.emit(this.websiteKS);
  }

  topicEvent(topics: string[]) {
    this.topics = topics;
  }
}
