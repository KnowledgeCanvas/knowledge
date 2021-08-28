import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {CdkDragDrop} from "@angular/cdk/drag-drop";
import {CanvasDropService} from "../../../../../shared/src/services/canvas-drop/canvas-drop.service";
import {Subscription} from "rxjs";
import {MatDialog} from "@angular/material/dialog";
import {KsQueueService} from "../../knowledge-source/ks-queue-service/ks-queue.service";
import {KnowledgeSource} from "../../../../../shared/src/models/knowledge.source.model";
import {KsInfoDialogComponent} from "../../knowledge-source/ks-info-dialog/ks-info-dialog.component";
import {ProjectService} from "../../../../../shared/src/services/projects/project.service";
import {ProjectUpdateRequest} from "../../../../../shared/src/models/project.model";

@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.scss']
})
export class SearchResultsComponent implements OnInit {
  ksQueue: KnowledgeSource[] = [];
  subscription: Subscription;

  constructor(private canvasDropService: CanvasDropService,
              private ksQueueService: KsQueueService,
              private projectService: ProjectService,
              private ref: ChangeDetectorRef,
              public dialog: MatDialog) {
    this.subscription = this.ksQueueService.ksQueue.subscribe((results: KnowledgeSource[]) => {
      this.ksQueue = results;
      if (results.length > 0)
        this.ref.markForCheck();
    });
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  drop(event: CdkDragDrop<any>) {
    console.log('Previous results: ', this.ksQueue);
    let newResults: KnowledgeSource = this.canvasDropService.drop(event);
    console.log('New results: ', newResults);
    this.ksQueue = [...this.ksQueue];
    console.log('Updated results: ', this.ksQueue);
  }

  displayContextPopup(ks: KnowledgeSource): void {
    const dialogRef = this.dialog.open(KsInfoDialogComponent, {
      width: '70%',
      data: ks,
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe(result => {
      this.ref.detectChanges();
    })
  }

  clearResults() {
    this.ksQueue = [];
    this.ksQueueService.clearResults();
  }

  importAll() {
    console.log('Importing all..');

    let currentProjectId = this.projectService.getCurrentProjectId();
    let update: ProjectUpdateRequest = {
      id: currentProjectId,
      addKnowledgeSource: this.ksQueue
    }
    this.projectService.updateProject(update);
    this.clearResults();
  }
}
