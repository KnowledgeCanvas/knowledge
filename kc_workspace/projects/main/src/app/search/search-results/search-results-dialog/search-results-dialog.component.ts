import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {DomSanitizer} from '@angular/platform-browser';
import {ExtractionService} from "../../../../../../shared/src/services/extraction/extraction.service";
import {KnowledgeSource} from "../../../../../../shared/src/models/knowledge.source.model";
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
              @Inject(MAT_DIALOG_DATA) public ks: KnowledgeSource,
              private _sanitizer: DomSanitizer,
              private extractionService: ExtractionService,
              private projectService: ProjectService,
              private searchService: SearchService) {
    this.projectService.currentProject.subscribe((project) => {
      this.currentProject = project;
    });
    this.qAndA = [];

    this.sourceRef = ks.sourceRef ? ks.sourceRef : '';

    if (ks.ingestType == 'google' && ks.googleItem) {
      if (ks.googleItem.pagemap?.question && ks.googleItem.pagemap?.answer)
        for (let i = 0; i < ks.googleItem.pagemap?.question?.length; i++) {
          this.qAndA.push({
            name: ks.googleItem.pagemap.question[i].name,
            text: ks.googleItem.pagemap.answer[i].text
          });
        }

      if (ks.googleItem.pagemap?.videoobject) {
        let url = ks.googleItem.pagemap.videoobject[0].embedurl ? ks.googleItem.pagemap.videoobject[0].embedurl : '';
        this.safeURL = this._sanitizer.bypassSecurityTrustResourceUrl(url);
      }
    }
  }

  ngOnInit(): void {
  }

  onNoClick() {
    this.dialogRef.close(this.ks);
  }

  openInBrowser() {
    console.log('Open in browser with data: ', this.ks);
    let url;

    if (typeof this.ks.accessLink === 'string')
      url = this.ks.accessLink;
    else
      url = this.ks.accessLink.href;

    window.open(url);
  }

  saveToPdf() {
    let link: string;
    if (typeof this.ks.accessLink === 'string')
      link = this.ks.accessLink;
    else
      link = this.ks.accessLink.href;
    this.extractionService.extractWebsite(link, this.ks.id.value);
    this.dialogRef.close();
  }

  showCitation() {
    console.log('Data to be cited: ', this.ks);
  }


  importSource() {
    console.log('Removing knowledge source: ', this.ks, ' from project ', this.currentProject);
    if (this.currentProject?.id) {
      let update: ProjectUpdateRequest = {
        id: this.currentProject.id,
        addKnowledgeSource: [this.ks]
      }
      this.projectService.updateProject(update);
      this.searchService.remove(this.ks);
      this.dialogRef.close(this.ks);
    } else {
      console.error('Attempting to import knowledge source to a project with no id...');
    }
  }
}
