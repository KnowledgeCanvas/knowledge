import {Component, ElementRef, Inject, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {ProjectModel} from "../../../../../shared/src/models/project.model";
import {KsQueueService} from "../ks-queue-service/ks-queue.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {ProjectService} from "../../../../../shared/src/services/projects/project.service";
import {IngestType} from "../../../../../shared/src/models/knowledge.source.model";

@Component({
  selector: 'app-canvas-import',
  templateUrl: './knowledge-source-import-dialog.component.html',
  styleUrls: ['./knowledge-source-import-dialog.component.scss']
})
export class KnowledgeSourceImportDialogComponent implements OnInit {
  @ViewChild('search') searchElement: ElementRef = {} as ElementRef;
  ingestType: IngestType = 'generic';
  searchTerm: string = '';
  stage_1: boolean = true;
  stage_2: boolean = false;
  stage_3: boolean = false;
  searchEnabled: boolean = false;
  extractionEnabled: boolean = false;
  filesEnabled: boolean = false;
  topicsEnabled: boolean = false;

  constructor(private dialogRef: MatDialogRef<any>,
              @Inject(MAT_DIALOG_DATA) public data: ProjectModel,
              private ksQueueService: KsQueueService,
              private snackBar: MatSnackBar,
              private projectService: ProjectService) {
  }

  ngOnInit(): void {
  }

  selectSearch() {
    this.ingestType = 'search';
    this.startTransition();
  }

  selectExtract() {
    this.ingestType = 'website';
    this.startTransition();
  }

  selectTopics() {
    this.ingestType = 'topic';
    this.startTransition();
  }

  selectFiles() {
    this.ingestType = 'file';
    this.startTransition();
  }

  submitSearch() {
    this.ksQueueService.search(this.searchTerm).then(() => {
      this.dialogRef.close();
    });
  }

  private startTransition() {
    this.stage_1 = false;
    this.resizeDialog();
  }

  private resizeDialog() {
    this.dialogRef.addPanelClass(['scale-out-center']);
    setTimeout(() => {
      this.stage_2 = true;
    }, 400);
    switch (this.ingestType) {
      case "search":
        setTimeout(() => {
          this.dialogRef.removePanelClass('scale-out-center');
          this.dialogRef.updateSize('70vw', 'auto');
          this.dialogRef.addPanelClass(['scale-up-center']);
          this.searchEnabled = true;
        }, 400);
        setTimeout(() => {
          this.searchElement.nativeElement.focus();
        }, 750);
        break;

      case "file":
        setTimeout(() => {
          this.dialogRef.removePanelClass('scale-out-center');
          this.dialogRef.updateSize('50vw', 'auto');
          this.dialogRef.addPanelClass(['scale-up-center']);
          this.filesEnabled = true;
        }, 400);
        break;

      case "website":
        setTimeout(() => {
          this.dialogRef.removePanelClass('scale-out-center');
          this.dialogRef.updateSize('70vw', 'auto');
          this.dialogRef.addPanelClass(['scale-up-center']);
          this.extractionEnabled = true;
        }, 400);
        break;

      case "topic":
        setTimeout(() => {
          this.dialogRef.removePanelClass('scale-out-center');
          this.dialogRef.updateSize('50vw', 'auto');
          this.dialogRef.addPanelClass(['scale-up-center']);
          this.topicsEnabled = true;
          this.performTopicSearch();
        }, 400);
        break;
    }
  }

  private performTopicSearch() {
    let projectId = this.projectService.getCurrentProjectId();
    let project = this.projectService.getProject(projectId.value);
    let message;

    if (!project?.topics || project.topics.length <= 0) {
      message = 'Add some topics first!';
      this.snackBar.open(message, 'Dismiss', {
        duration: 3000,
        panelClass: ['ingest-snackbar']
      });
      this.dialogRef.close();
      return;
    }

    message = "Searching for topics...";
    this.snackBar.open(message, 'Dismiss', {
      duration: 3000
    });

    this.ksQueueService.topicSearch(project.topics).then((result) => {
      this.dialogRef.close();
    });
  }
}
