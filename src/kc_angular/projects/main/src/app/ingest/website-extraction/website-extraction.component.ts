import {
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  SecurityContext,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {
  KnowledgeSource,
  KnowledgeSourceReference,
  SourceModel
} from "../../../../../shared/src/models/knowledge.source.model";
import {UuidModel} from "../../../../../shared/src/models/uuid.model";
import {ProjectService} from "../../../../../ks-lib/src/lib/services/projects/project.service";
import {MatDialogRef} from "@angular/material/dialog";
import {KsQueueService} from "../../knowledge-source/ks-queue-service/ks-queue.service";
import {WebsiteMetadataModel, WebsiteModel} from "../../../../../shared/src/models/website.model";
import {ExtractionService} from "../../../../../ks-lib/src/lib/services/extraction/extraction.service";
import {UuidService} from "../../../../../ks-lib/src/lib/services/uuid/uuid.service";
import {FaviconExtractorService} from "../../../../../ks-lib/src/lib/services/favicon/favicon-extractor.service";
import {DomSanitizer} from "@angular/platform-browser";
import {ProjectModel, ProjectUpdateRequest} from "../../../../../shared/src/models/project.model";

@Component({
  selector: 'app-website-extraction',
  templateUrl: './website-extraction.component.html',
  styleUrls: ['./website-extraction.component.scss']
})
export class WebsiteExtractionComponent implements OnInit, OnChanges {
  @ViewChild('extractor') extractorElement: ElementRef = {} as ElementRef;
  @Input() currentProject: ProjectModel | undefined = undefined;
  url: string = '';
  parentId: UuidModel | undefined = undefined;
  websiteKS: KnowledgeSource | undefined = undefined;
  panelOpenState = false;
  validUrl: boolean = false;
  title: string = '';
  topics: string[] = [];
  icon: any;
  validating: boolean = false;
  destination: 'project' | 'queue' = 'queue';

  constructor(private projectService: ProjectService,
              private ksQueueService: KsQueueService,
              private dialogRef: MatDialogRef<any>,
              private extractionService: ExtractionService,
              private uuidService: UuidService,
              private faviconService: FaviconExtractorService,
              private sanitizer: DomSanitizer) {
  }


  ngOnInit(): void {
    setTimeout(() => {
      this.extractorElement.nativeElement.focus();
    }, 350);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.currentProject.currentValue) {
      this.parentId = changes.currentProject.currentValue.id;
    }
  }

  ksChange(ks: KnowledgeSource) {
    this.ksQueueService.enqueue([ks]);
    this.dialogRef.close();
  }

  checkUrl() {
    this.validating = true;

    let sanitizedUrl = this.sanitizer.sanitize(SecurityContext.URL, this.url);

    if (!sanitizedUrl) {
      console.error('Unable to sanitize URL. Exiting.');
      this.dialogRef.close();
      return;
    }
    this.url = sanitizedUrl;

    this.extractionService.extractWebsiteMetadata(this.url).then((metadata: WebsiteMetadataModel) => {
      this.title = metadata.title ? metadata.title : '';

      // ------------------------------------------------------------------------------------------
      // Construct WebsiteModel and KS reference
      let siteUrl = new URL(this.url);
      const site: WebsiteModel = {url: this.url, dateExtracted: Date(), metadata: metadata};
      const source = new SourceModel(undefined, undefined, site);
      const ref = new KnowledgeSourceReference('website', source, siteUrl);
      const uuid = this.uuidService.generate(1)[0];

      // ------------------------------------------------------------------------------------------
      // Create new Knowledge Source
      this.websiteKS = new KnowledgeSource(this.title, uuid, 'website', ref);
      this.websiteKS.icon = metadata.icon ? metadata.icon : this.faviconService.generic();
      this.websiteKS.iconUrl = this.faviconService.generic();

      // ------------------------------------------------------------------------------------------
      // Change dialog state
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
    if (this.destination === 'project' && this.websiteKS && this.parentId) {
      let update: ProjectUpdateRequest = {
        id: this.parentId,
        addKnowledgeSource: [this.websiteKS]
      };
      this.projectService.updateProject(update);
    } else {
      if (this.websiteKS) {
        this.ksQueueService.enqueue([this.websiteKS]);
      }
    }
    this.dialogRef.close();
  }

  emplaceIds() {
    if (this.websiteKS) {
      this.websiteKS.topics = [];
      if (this.topics.length > 0) {
        for (let i = 0; i < this.topics.length; i++) {
          this.websiteKS.topics.push(this.topics[i]);
        }
      }
    }
  }

  emplaceMetadata() {
    let url = new URL(this.url);
    if (this.websiteKS) {
      this.websiteKS.title = this.title;
      if (this.parentId)
        this.websiteKS.associatedProjects = [this.parentId];
      this.websiteKS.sourceRef = 'extract';
      this.websiteKS.iconUrl = url.hostname;
    }
  }

  topicEvent(topics: string[]) {
    this.topics = topics;
  }

  setDestination(destination: "project" | "queue") {
    this.destination = destination;
  }
}
