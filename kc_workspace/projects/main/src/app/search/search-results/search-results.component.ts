import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation} from '@angular/core';
import {CdkDragDrop} from "@angular/cdk/drag-drop";
import {CanvasDropService} from "../../../../../shared/src/services/canvas-drop/canvas-drop.service";
import {Subscription} from "rxjs";
import {MatDialog} from "@angular/material/dialog";
import {SearchService} from "../../../../../shared/src/services/search/search.service";
import {KnowledgeSource} from "../../../../../shared/src/models/knowledge.source.model";
import {KsInfoDialogComponent} from "../../knowledge-source/ks-info-dialog/ks-info-dialog.component";

@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchResultsComponent implements OnInit {
  searchResults: KnowledgeSource[] = [];

  constructor(private canvasDropService: CanvasDropService,
              public dialog: MatDialog,
              private searchService: SearchService,
              private ref: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.searchService.searchList.subscribe((results: KnowledgeSource[]) => {
      this.searchResults = results;
      this.ref.markForCheck();
      // this.ref.detectChanges();
    });
  }

  ngOnDestroy() {
  }

  drop(event: CdkDragDrop<any>) {
    console.log('Previous results: ', this.searchResults);
    let newResults: KnowledgeSource = this.canvasDropService.drop(event);
    console.log('New results: ', newResults);
    this.searchResults = [...this.searchResults];
    console.log('Updated results: ', this.searchResults);
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
    this.searchResults = [];
    this.searchService.clearResults();
  }

  swipeUp(event: any, when: string, item: KnowledgeSource) {
    console.log('event: ', event);
    console.log('when: ', when);
    console.log('Swipe up on KS model: ', item);
  }
}
