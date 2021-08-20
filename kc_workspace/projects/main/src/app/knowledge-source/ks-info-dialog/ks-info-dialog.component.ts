import {AfterViewInit, Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {KnowledgeSourceModel} from "../../../../../shared/src/models/knowledge.source.model";
import {DomSanitizer, SafeUrl} from "@angular/platform-browser";
import {ExtractionService} from "../../extraction/extraction.service";
import {ProjectService} from "../../../../../shared/src/services/projects/project.service";
import {SearchService} from "../../../../../shared/src/services/search/search.service";
import {ProjectModel, ProjectUpdateRequest} from "../../../../../shared/src/models/project.model";
import {MatTabChangeEvent} from "@angular/material/tabs";
import {Clipboard} from "@angular/cdk/clipboard";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-ks-info-dialog',
  templateUrl: './ks-info-dialog.component.html',
  styleUrls: ['./ks-info-dialog.component.scss']
})
export class KsInfoDialogComponent implements OnInit, AfterViewInit {
  currentProject: ProjectModel | null = null;
  url: string | null = null;
  safeUrl: SafeUrl | undefined;
  sourceRef: string = '';
  viewReady: boolean = false;

  constructor(public dialogRef: MatDialogRef<KsInfoDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public knowledgeSource: KnowledgeSourceModel,
              private _sanitizer: DomSanitizer,
              private extractionService: ExtractionService,
              private projectService: ProjectService,
              private searchService: SearchService,
              private clipboard: Clipboard,
              private snackBar: MatSnackBar) {

    this.projectService.currentProject.subscribe((project) => {
      this.currentProject = project;
    });

    this.dialogRef.beforeClosed().subscribe(() => {
      window.api.send("electron-close-browser-view");
    });

    this.sourceRef = knowledgeSource.sourceRef ? knowledgeSource.sourceRef : '';
  }

  ngAfterViewInit() {
  }

  ngOnInit(): void {
  }

  emplaceKnowledgeSourceView() {
    // Depending on the knowledge source, prepare a safe URL to load into an iframe. Currently only PDF's and
    // Wikipedia is supported.
    if (this.knowledgeSource && this.knowledgeSource.fileItem && this.knowledgeSource.fileItem.path) {
      this.safeUrl = this._sanitizer.bypassSecurityTrustResourceUrl('file://' + this.knowledgeSource.fileItem.path);
      this.viewReady = true;
    } else {
      let url, sanitizedUrl;

      if (this.knowledgeSource.googleItem?.link) {
        url = new URL(this.knowledgeSource.googleItem.link);
      } else if (this.knowledgeSource.websiteItem?.url) {
        url = new URL(this.knowledgeSource.websiteItem.url);
      }

      if (url) {
        sanitizedUrl = this._sanitizer.sanitize(4, url.href);
      }

      if (sanitizedUrl) {
        window.api.receive("electron-browser-view-results", (data: any) => {
          console.log('electron-browser-view-results: ', data);
          this.viewReady = true;
        });

        // Get bounding box info for display element
        let position = this.getBrowserViewDimensions('electron-browser-view');

        let args = {
          url: sanitizedUrl,
          x: Math.floor(position.x + 2),
          y: Math.floor(position.y + 2),
          width: Math.floor(position.width - 4),
          height: Math.floor(position.height - 4)
        }

        window.api.send("electron-browser-view", args);
      }
    }
  }

  openInBrowser() {
    if (this.knowledgeSource.websiteItem?.url) {
      window.open(this.knowledgeSource.websiteItem.url);
    } else if (this.knowledgeSource.googleItem?.link) {
      window.open(this.knowledgeSource.googleItem.link)
    } else {
      window.open(this.knowledgeSource.fileItem?.path);
    }
  }

  getBrowserViewDimensions(elementName: string): any {
    let element = document.getElementById(elementName);
    if (element) {
      return element.getBoundingClientRect();

    }
  }

  getOffset(el: any) {
    const rect = el.getBoundingClientRect();
    return {
      left: rect.left + window.scrollX,
      top: rect.top + window.scrollY
    };
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
    console.log('Importing result to project', this.currentProject?.name, this.knowledgeSource);
    if (this.currentProject?.id) {
      let projectUpdate: ProjectUpdateRequest = {
        id: this.currentProject.id,
        addKnowledgeSource: [this.knowledgeSource]
      }
      this.projectService.updateProject(projectUpdate);
      this.searchService.remove(this.knowledgeSource);
      this.dialogRef.close(this.knowledgeSource);
    } else {
      console.error('IMPORT SOURCE WITH NO PROJECT ID Not implemented');
    }
  }

  removeSource() {
    if (this.currentProject?.id) {
      let update: ProjectUpdateRequest = {
        id: this.currentProject.id,
        removeKnowledgeSource: [this.knowledgeSource]
      }
      this.projectService.updateProject(update);
      this.dialogRef.close();
    } else {
      console.error(`Attempting to remove ${this.knowledgeSource.id.value} with invalid project id...`);
    }
  }

  tabClick($event: MatTabChangeEvent) {
    console.log('Tab changed: ', $event);
    switch ($event.index) {
      case 0:
        window.api.send("electron-close-browser-view");
        break;
      case 1:
        this.emplaceKnowledgeSourceView();
        break;
    }
  }

  copyLink() {
    let message: string | undefined = undefined;

    switch (this.knowledgeSource.ingestType) {
      case "file":
        message = this.knowledgeSource.fileItem?.path;
        break;
      case "google":
        message = this.knowledgeSource.googleItem?.link;
        break;
      case "website":
        message = this.knowledgeSource.websiteItem?.url;
    }
    if (message) {
      this.clipboard.copy(message);
      this.snackBar.open('Copied to clipboard!', 'Dismiss', {
        duration: 3000
      });
    }

  }

  updateKS() {
    console.log('Updating KS...');
    if (this.currentProject?.id) {
      let update: ProjectUpdateRequest = {
        id: this.currentProject?.id,
        updateKnowledgeSource: [this.knowledgeSource]
      }
      this.projectService.updateProject(update);
    }
  }
}
