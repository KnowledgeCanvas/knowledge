import {AfterViewInit, ChangeDetectorRef, Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {KnowledgeSource} from "../../../../../shared/src/models/knowledge.source.model";
import {DomSanitizer, SafeUrl} from "@angular/platform-browser";
import {ExtractionService} from "../../../../../shared/src/services/extraction/extraction.service";
import {ProjectService} from "../../../../../shared/src/services/projects/project.service";
import {KsQueueService} from "../ks-queue-service/ks-queue.service";
import {ProjectModel, ProjectUpdateRequest} from "../../../../../shared/src/models/project.model";
import {MatTabChangeEvent} from "@angular/material/tabs";
import {Clipboard} from "@angular/cdk/clipboard";
import {MatSnackBar} from "@angular/material/snack-bar";
import {
  BrowserViewRequest,
  ElectronIpcService,
  IpcResponse
} from "../../../../../ks-lib/src/lib/services/electron-ipc/electron-ipc.service";
import {UuidService} from "../../../../../shared/src/services/uuid/uuid.service";


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
  ksChanged: boolean = false;
  title: string = '';
  notes: string = '';

  constructor(public dialogRef: MatDialogRef<KsInfoDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public ks: KnowledgeSource,
              private extractionService: ExtractionService,
              private projectService: ProjectService,
              private ipcService: ElectronIpcService,
              private changeRef: ChangeDetectorRef,
              private ksQueueService: KsQueueService,
              private _sanitizer: DomSanitizer,
              private clipboard: Clipboard,
              private snackBar: MatSnackBar) {

    this.projectService.currentProject.subscribe((project) => {
      this.currentProject = project;
    });

    this.dialogRef.beforeClosed().subscribe(() => {
      this.ipcService.closeBrowserView();
      this.dialogRef.close({ksChanged: this.ksChanged, ks: this.ks});
    });

    console.log('Setting notes to ks notes: ', ks.notes.text);
    this.title = ks.title;
    this.notes = ks.notes.text;
    this.sourceRef = ks.sourceRef ? ks.sourceRef : '';
  }

  ngAfterViewInit() {
  }

  ngOnInit(): void {
  }

  emplaceKnowledgeSourceView() {
    if (this.ks && this.ks.fileItem && this.ks.fileItem.path) {
      this.safeUrl = this._sanitizer.bypassSecurityTrustResourceUrl('file://' + this.ks.fileItem.path);
      this.ks.dateAccessed = new Date();
      this.viewReady = true;
      this.ksChanged = true;
      return;
    }

    let url, sanitizedUrl;
    if (typeof this.ks.accessLink === "string")
      url = new URL(this.ks.accessLink);
    else
      url = this.ks.accessLink

    sanitizedUrl = this._sanitizer.sanitize(4, url.href);
    if (!sanitizedUrl) {
      console.error('Unable to sanitize url...');
      return;
    }

    // --------------------------------------------------------------------------------
    // Send KsBrowserViewRequest
    let position = this.getBrowserViewDimensions('electron-browser-view');
    let request: BrowserViewRequest = {
      url: sanitizedUrl,
      x: Math.floor(position.x),
      y: Math.floor(position.y),
      width: Math.floor(position.width),
      height: Math.floor(position.height)
    }
    this.ipcService.openBrowserView(request).then((response: IpcResponse) => {
      if (response.success) {
        this.ks.dateAccessed = new Date();
        this.viewReady = true;
        this.ksChanged = true;
        this.changeRef.detectChanges();
      } else {
        // TODO: let the user know that an error has occurred (this should hopefully never happen)
        console.error('Error attempting to open Electron BrowserView');
        console.error(response.error ? response.error : response);
        return;
      }
    });
  }

  openInBrowser() {
    let url;
    if (typeof this.ks.accessLink === 'string')
      url = this.ks.accessLink
    else
      url = this.ks.accessLink.href;

    window.open(url);
    this.ks.dateAccessed = new Date();
    this.ksChanged = true;
    this.dialogRef.close();
  }

  getBrowserViewDimensions(elementName: string): any {
    let element = document.getElementById(elementName);
    if (element) {
      return element.getBoundingClientRect();
    }
  }

  saveToPdf() {
    let link: string;
    if (typeof this.ks.accessLink === 'string')
      link = this.ks.accessLink
    else
      link = this.ks.accessLink.href;
    this.extractionService.extractWebsite(link, this.ks.id.value);
    this.dialogRef.close();
  }

  importSource() {
    console.log('Importing result to project', this.currentProject?.name, this.ks);
    if (this.currentProject?.id) {
      // Set timestamp based on when the source was actually improted into the system
      this.ks.dateCreated = new Date();
      this.ks.dateAccessed = new Date();
      this.ks.dateModified = new Date();

      console.log('Setting KS notes to: ', this.notes);

      this.ks.notes.text = this.notes;

      // Update the project to persist the new source
      let projectUpdate: ProjectUpdateRequest = {
        id: this.currentProject.id,
        addKnowledgeSource: [this.ks]
      }
      this.projectService.updateProject(projectUpdate);
      this.ksQueueService.remove(this.ks);
      this.dialogRef.close();
    } else {
      console.error('IMPORT SOURCE WITH NO PROJECT ID Not implemented');
    }
  }

  removeSource() {
    if (this.currentProject?.id) {
      let update: ProjectUpdateRequest = {
        id: this.currentProject.id,
        removeKnowledgeSource: [this.ks]
      }
      this.projectService.updateProject(update);
      this.dialogRef.close();
    } else {
      console.error(`Attempting to remove ${this.ks.id.value} with invalid project id...`);
    }
  }

  tabClick($event: MatTabChangeEvent) {
    console.log('Tab changed: ', $event);
    switch ($event.index) {
      case 0:
        this.ipcService.closeBrowserView();
        this.changeRef.markForCheck();
        break;
      case 1:
        this.emplaceKnowledgeSourceView();
        break;
      case 2:
        this.ipcService.closeBrowserView();
        this.ks.notes.dateAccessed = new Date();
        this.changeRef.markForCheck();
        break;
    }
  }

  copyLink() {
    let link: string | URL = this.ks.accessLink;
    if (typeof link === 'string') {
      this.clipboard.copy(link);
    } else {
      this.clipboard.copy(link.href);
    }
    this.snackBar.open('Copied to clipboard!', 'Dismiss', {
      duration: 3000
    });
  }

  updateKS() {
    if (this.ks.title.length === 0) {
      return;
    }

    console.log('Updating KS...', this.ks);
    if (this.currentProject?.id) {
      this.ks.dateModified = new Date();
      let update: ProjectUpdateRequest = {
        id: this.currentProject?.id,
        updateKnowledgeSource: [this.ks]
      }
      this.projectService.updateProject(update);
    }
  }

  ksModified(modified: boolean) {
    this.ksChanged = modified;
  }

  notesModified() {
    if (this.ks.notes.text === this.notes)
      return;

    this.ks.notes.text = this.notes;
    this.ks.notes.dateModified = new Date();
    this.ks.dateModified = new Date();
    this.ksChanged = true;
  }

  removeQueueItem() {
    this.ksQueueService.remove(this.ks);
    this.dialogRef.close();
  }
}
