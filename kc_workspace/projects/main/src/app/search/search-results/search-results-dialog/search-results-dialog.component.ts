import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {DomSanitizer} from '@angular/platform-browser';
import {ExtractionService} from "../../../extraction/extraction.service";
import {KnowledgeSourceModel} from "../../../../../../shared/src/models/knowledge.source.model";
import {ProjectService} from "../../../../../../shared/src/services/projects/project.service";
import {ProjectModel, ProjectUpdateRequest} from "../../../../../../shared/src/models/project.model";
import {SearchService} from "../../../../../../shared/src/services/search/search.service";

@Component({
  selector: 'app-search-results-dialog',
  templateUrl: './search-results-dialog.component.html',
  styleUrls: ['./search-results-dialog.component.scss']
})
export class SearchResultsDialogComponent implements OnInit {
  currentProject: ProjectModel | null = null;
  qAndA: any[];
  safeURL;
  sourceRef: string = '';

  constructor(public dialogRef: MatDialogRef<SearchResultsDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public knowledgeSource: KnowledgeSourceModel,
              private _sanitizer: DomSanitizer,
              private extractionService: ExtractionService,
              private projectService: ProjectService,
              private searchService: SearchService) {
    this.projectService.currentProject.subscribe((project) => {
      this.currentProject = project;
    });
    this.qAndA = [];

    this.sourceRef = knowledgeSource.sourceRef ? knowledgeSource.sourceRef : '';

    if (knowledgeSource.ingestType == 'google' && knowledgeSource.googleItem) {
      if (knowledgeSource.googleItem.pagemap?.question && knowledgeSource.googleItem.pagemap?.answer)
        for (let i = 0; i < knowledgeSource.googleItem.pagemap?.question?.length; i++) {
          this.qAndA.push({
            name: knowledgeSource.googleItem.pagemap.question[i].name,
            text: knowledgeSource.googleItem.pagemap.answer[i].text
          });
        }

      if (knowledgeSource.googleItem.pagemap?.videoobject) {
        let url = knowledgeSource.googleItem.pagemap.videoobject[0].embedurl ? knowledgeSource.googleItem.pagemap.videoobject[0].embedurl : '';
        this.safeURL = this._sanitizer.bypassSecurityTrustResourceUrl(url);
      }
    }
  }

  ngOnInit(): void {
  }

  onNoClick() {
    this.dialogRef.close(this.knowledgeSource);
  }

  openInBrowser() {
    console.log('Open in browser with data: ', this.knowledgeSource);
    if (this.knowledgeSource.googleItem?.link) {
      window.open(this.knowledgeSource.googleItem.link);
    } else if (this.knowledgeSource.websiteItem?.url) {
      window.open(this.knowledgeSource.websiteItem.url);
    } else {
      console.error('Unable to open link for knowledge source: ', this.knowledgeSource);
    }
  }

  saveToPdf() {
    let link: string;

    if (this.knowledgeSource.googleItem?.link)
      link = this.knowledgeSource.googleItem.link;
    else if (this.knowledgeSource.websiteItem?.url)
      link = this.knowledgeSource.websiteItem.url;
    else {
      console.error('Unable to save to PDF because no valid links exist in knowledge source: ', this.knowledgeSource);
      return;
    }

    this.extractionService.extractWebsite(link, this.knowledgeSource.id.value);

    // TODO: make the above function return a promise, notify the user about progress

    this.dialogRef.close();
  }

  showCitation() {
    console.log('Data to be cited: ', this.knowledgeSource);
  }


  importSource() {
    if (this.currentProject?.id) {
      let update: ProjectUpdateRequest = {
        id: this.currentProject.id,
        addKnowledgeSource: [this.knowledgeSource]
      }
      this.projectService.updateProject(update);
      this.searchService.remove(this.knowledgeSource);
      this.dialogRef.close(this.knowledgeSource);
    } else {
      console.error('Attempting to import knowledge source to a project with no id...');
    }
  }
}
