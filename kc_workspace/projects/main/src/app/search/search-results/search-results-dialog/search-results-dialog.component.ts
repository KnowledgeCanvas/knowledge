import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {DomSanitizer} from '@angular/platform-browser';
import {ExtractionService} from "../../../extraction/extraction.service";
import {KnowledgeSourceModel} from "../../../../../../shared/src/models/knowledge.source.model";
import {ProjectService} from "../../../../../../shared/src/services/projects/project.service";
import {ProjectModel} from "../../../../../../shared/src/models/project.model";
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
              @Inject(MAT_DIALOG_DATA) public data: KnowledgeSourceModel,
              private _sanitizer: DomSanitizer,
              private extractionService: ExtractionService,
              private projectService: ProjectService,
              private searchService: SearchService) {
    this.projectService.currentProject.subscribe((project) => {
      this.currentProject = project;
    });
    this.qAndA = [];

    this.sourceRef = data.sourceRef ? data.sourceRef : '';

    if (data.ingestType == 'google' && data.googleItem) {
      if (data.googleItem.pagemap?.question && data.googleItem.pagemap?.answer)
        for (let i = 0; i < data.googleItem.pagemap?.question?.length; i++) {
          this.qAndA.push({
            name: data.googleItem.pagemap.question[i].name,
            text: data.googleItem.pagemap.answer[i].text
          });
        }

      if (data.googleItem.pagemap?.videoobject) {
        let url = data.googleItem.pagemap.videoobject[0].embedurl ? data.googleItem.pagemap.videoobject[0].embedurl : '';
        this.safeURL = this._sanitizer.bypassSecurityTrustResourceUrl(url);
      }
    }
  }

  ngOnInit(): void {
  }

  onNoClick() {
    this.dialogRef.close(this.data);
  }

  openInBrowser() {
    console.log('Open in browser with data: ', this.data);
    if (this.data.url) {
      window.open(this.data.url);
    } else if (this.data.googleItem?.link) {
      window.open(this.data.googleItem.link);
    }
  }

  saveToPdf() {
    if (this.data.url) {
      this.extractionService.extractWebpage(this.data.url, this.data.title);
    } else if (this.data.googleItem?.link) {
      this.extractionService.extractWebpage(this.data.googleItem.link, this.data.title);
    }

  }

  showCitation() {
    console.log('Data to be cited: ', this.data);
  }


  importSource() {
    console.log('Importing result to project', this.data);
    if (this.currentProject?.id) {
      this.projectService.addKnowledgeSource(this.currentProject.id, this.data);
      this.searchService.remove(this.data);
      this.dialogRef.close(this.data);
    } else {

    }
  }

  removeSource() {
    if (this.currentProject?.id) {
      this.projectService.removeKnowledgeSource(this.currentProject.id, this.data);
      this.dialogRef.close();
    }

  }
}
