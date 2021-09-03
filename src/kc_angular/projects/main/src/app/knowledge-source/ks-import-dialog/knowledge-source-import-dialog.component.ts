import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {ProjectModel} from "projects/ks-lib/src/lib/models/project.model";
import {KsQueueService} from "../ks-queue-service/ks-queue.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {ProjectService} from "../../../../../ks-lib/src/lib/services/projects/project.service";
import {IngestType} from "projects/ks-lib/src/lib/models/knowledge.source.model";

@Component({
  selector: 'app-canvas-import',
  templateUrl: './knowledge-source-import-dialog.component.html',
  styleUrls: ['./knowledge-source-import-dialog.component.scss']
})
export class KnowledgeSourceImportDialogComponent implements OnInit {
  ingestType: IngestType = 'generic';
  searchTerm: string = '';
  stage_1: boolean = true;
  stage_2: boolean = false;
  stage_3: boolean = false;
  extractionEnabled: boolean = false;
  filesEnabled: boolean = false;
  topicsEnabled: boolean = false;
  noteEnabled: boolean = false;
  notes: string = '';
  currentProject: ProjectModel | undefined;
  destination: 'project' | 'queue' = 'project';
  color: any;

  constructor(private dialogRef: MatDialogRef<any>,
              @Inject(MAT_DIALOG_DATA) public data: ProjectModel,
              private ksQueueService: KsQueueService,
              private snackBar: MatSnackBar,
              private projectService: ProjectService) {
    this.currentProject = projectService.getProject(projectService.getCurrentProjectId().value);
  }

  ngOnInit(): void {
  }

  selectSearch() {
    this.ingestType = 'search';
    this.startTransition();
  }

  selectNote() {
    this.ingestType = 'note';
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
    // this.ksQueueService.search(this.searchTerm).then(() => {
    //   this.dialogRef.close();
    // });
  }

  cancel() {
    this.dialogRef.close();
  }

  changeStyle($event: MouseEvent) {

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
      case "note":
        setTimeout(() => {
          this.dialogRef.removePanelClass('scale-out-center');
          this.dialogRef.updateSize('55vw', 'auto');
          this.dialogRef.addPanelClass(['scale-up-center']);
          this.noteEnabled = true;
        }, 400);
        break;

      case "file":
        setTimeout(() => {
          this.dialogRef.removePanelClass('scale-out-center');
          this.dialogRef.updateSize('70vw', 'auto');
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
        this.performTopicSearch();
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
        verticalPosition: 'bottom',
        panelClass: ['ingest-snackbar', 'kc-danger-zone']
      });
      this.dialogRef.close();
      return;
    }

    this.ksQueueService.topicSearch(project.topics).then((result) => {
      this.dialogRef.close();
    });
  }
}
