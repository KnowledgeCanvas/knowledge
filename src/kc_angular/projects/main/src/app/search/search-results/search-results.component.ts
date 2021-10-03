import {Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges} from '@angular/core';
import {KsDropService} from "../../../../../ks-lib/src/lib/services/ks-drop/ks-drop.service";
import {MatDialog} from "@angular/material/dialog";
import {KnowledgeSource} from "projects/ks-lib/src/lib/models/knowledge.source.model";
import {KsInfoDialogComponent, KsInfoDialogInput, KsInfoDialogOutput} from "../../knowledge-source/ks-info-dialog/ks-info-dialog.component";
import {BrowserViewDialogService} from "../../../../../ks-lib/src/lib/services/browser-view-dialog/browser-view-dialog.service";

@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.scss']
})
export class SearchResultsComponent implements OnInit, OnChanges, OnDestroy {
  ksListId = 'ksQueue';

  @Input()
  ksQueueLoading: boolean = false;

  @Input()
  ksList: KnowledgeSource[] = [];

  @Input()
  kcProjectId: string | undefined = undefined;

  @Output()
  ksQueueCleared = new EventEmitter<any>();

  @Output()
  ksImported = new EventEmitter<KnowledgeSource[]>();

  @Output()
  ksRemoved = new EventEmitter<KnowledgeSource>();

  constructor(private browserViewDialogService: BrowserViewDialogService,
              private ksDropService: KsDropService,
              public dialog: MatDialog) {
    ksDropService.register({
      containerId: this.ksListId,
      receiveFrom: [],
      sendTo: ['projectKsList'],
      allowSort: true
    });
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.ksList) {
      this.ksList = changes.ksList.currentValue;
    }
  }

  ngOnDestroy() {
    this.ksDropService.unregister(this.ksListId);
  }

  displayContextPopup(ks: KnowledgeSource): void {
    let dialogInput: KsInfoDialogInput = {
      source: 'ks-queue',
      ks: ks,
      projectId: this.kcProjectId
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
        let found = this.ksList.find(k => k.id.value === result.ks?.id.value);
        if (found) {
          found = result.ks;
        }
      }

      if (result.preview) {
        this.browserViewDialogService.open({ks: ks});
      }

    })
  }

  clearResults() {
    this.ksList = [];
    this.ksQueueCleared.emit();
  }

  importAll() {
    if (!this.kcProjectId)
      return;
    this.ksImported.emit(this.ksList);
    this.clearResults();
  }

  ksSelected($event: KnowledgeSource) {
    this.displayContextPopup($event);
  }

  ksListChanged(ksList: KnowledgeSource[]) {
    this.ksList = ksList;
    if (ksList.length === 0)
      this.ksQueueCleared.emit();
  }
}
