import {Component, OnInit} from '@angular/core';
import {CdkDragDrop} from "@angular/cdk/drag-drop";
import {KsDropService} from "../../../../../ks-lib/src/lib/services/ks-drop/ks-drop.service";
import {Subscription} from "rxjs";
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import {KsQueueService} from "../../knowledge-source/ks-queue-service/ks-queue.service";
import {KnowledgeSource} from "projects/ks-lib/src/lib/models/knowledge.source.model";
import {KsInfoDialogComponent, KsInfoDialogInput, KsInfoDialogOutput} from "../../knowledge-source/ks-info-dialog/ks-info-dialog.component";
import {ProjectService} from "../../../../../ks-lib/src/lib/services/projects/project.service";
import {ProjectUpdateRequest} from "projects/ks-lib/src/lib/models/project.model";
import {KsPreviewComponent, KsPreviewInput} from "../../knowledge-source/ks-preview/ks-preview.component";

@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.scss']
})
export class SearchResultsComponent implements OnInit {
  loading: boolean = false;
  ksQueue: KnowledgeSource[] = [];
  ksQueueSubscription: Subscription;
  ksQueueLoadingSubscription: Subscription;

  constructor(private canvasDropService: KsDropService,
              private ksQueueService: KsQueueService,
              private projectService: ProjectService,
              public dialog: MatDialog) {
    this.ksQueueSubscription = this.ksQueueService.ksQueue.subscribe((results: KnowledgeSource[]) => {
      this.ksQueue = results;
    });
    this.ksQueueLoadingSubscription = this.ksQueueService.loading.subscribe((loading) => {
      this.loading = loading;
    });
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.ksQueueSubscription.unsubscribe();
  }

  drop(event: CdkDragDrop<any>) {
    this.canvasDropService.drop(event);
    this.ksQueue = [...this.ksQueue];
  }

  displayContextPopup(ks: KnowledgeSource): void {
    let dialogInput: KsInfoDialogInput = {
      source: 'ks-queue',
      ks: ks
    }

    const dialogRef = this.dialog.open(KsInfoDialogComponent, {
      width: '70%',
      minWidth: '50vw',
      height: 'auto',
      maxHeight: '95vh',
      data: dialogInput,
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe((result: KsInfoDialogOutput) => {
      if (result.ks && result.ksChanged) {
        let found = this.ksQueue.find(k => k.id.value === result.ks?.id.value);
        if (found) {
          console.log('Ks found: ', found);
          found = result.ks;
        }
      }

      if (result.preview) {
        this.preview(result.ks);
      }

    })
  }

  preview(ks: KnowledgeSource) {
    let ksPreviewInput: KsPreviewInput = {
      ks: ks
    };

    let config: MatDialogConfig = {
      autoFocus: false,
      minWidth: '95vw',
      width: 'auto',
      minHeight: 'auto',
      height: '90vh',
      maxHeight: 'calc(100vh - 72px)',
      data: ksPreviewInput
    }

    const dialogRef = this.dialog.open(KsPreviewComponent, config);
    dialogRef.afterClosed().subscribe((results) => {
      /**
       * TODO: this currently doesn't do anything because there are no changes in the preview dialog
       * However, there will eventually be changes such as highlighting a document or text in a web page...
       */
    });
  }

  clearResults() {
    this.ksQueue = [];
    this.ksQueueService.clearResults();
  }

  importAll() {
    let currentProjectId = this.projectService.getCurrentProjectId();
    let update: ProjectUpdateRequest = {
      id: currentProjectId,
      addKnowledgeSource: this.ksQueue
    }
    this.projectService.updateProject(update);
    this.clearResults();
  }
}
