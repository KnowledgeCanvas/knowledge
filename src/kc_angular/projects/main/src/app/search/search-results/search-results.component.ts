import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {CdkDragDrop} from "@angular/cdk/drag-drop";
import {KsDropService} from "../../../../../ks-lib/src/lib/services/ks-drop/ks-drop.service";
import {Subscription} from "rxjs";
import {MatDialog} from "@angular/material/dialog";
import {KsQueueService} from "../../knowledge-source/ks-queue-service/ks-queue.service";
import {KnowledgeSource} from "projects/ks-lib/src/lib/models/knowledge.source.model";
import {KsInfoDialogComponent} from "../../knowledge-source/ks-info-dialog/ks-info-dialog.component";
import {ProjectService} from "../../../../../ks-lib/src/lib/services/projects/project.service";
import {ProjectUpdateRequest} from "projects/ks-lib/src/lib/models/project.model";

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
              private ref: ChangeDetectorRef,
              public dialog: MatDialog) {
    this.ksQueueSubscription = this.ksQueueService.ksQueue.subscribe((results: KnowledgeSource[]) => {
      this.ksQueue = results;
      if (results.length > 0)
        this.ref.markForCheck();
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
    let currentProjectId = this.projectService.getCurrentProjectId();
    let update: ProjectUpdateRequest = {
      id: currentProjectId,
      addKnowledgeSource: this.ksQueue
    }
    this.projectService.updateProject(update);
    this.clearResults();
  }
}
