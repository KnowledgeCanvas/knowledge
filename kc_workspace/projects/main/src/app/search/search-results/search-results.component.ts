import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation} from '@angular/core';
import {CdkDragDrop} from "@angular/cdk/drag-drop";
import {GoogleSearchItemModel} from "../../../../../shared/src/models/google.search.results.model";
import {CanvasDropService} from "../../../../../shared/src/services/canvas-drop/canvas-drop.service";
import {Subscription} from "rxjs";
import {MatDialog} from "@angular/material/dialog";
import {SearchResultsDialogComponent} from "./search-results-dialog/search-results-dialog.component";
import {SearchService} from "../../../../../shared/src/services/search/search.service";

@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchResultsComponent implements OnInit {
  googleSearchResults: GoogleSearchItemModel[] = [];
  subscription: Subscription | undefined;

  constructor(private canvasDropService: CanvasDropService,
              public dialog: MatDialog,
              private searchService: SearchService,
              private ref: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.subscription = this.searchService.currentMessage.subscribe((results) => {
      console.log('Subscription updated with data: ', results);
      for (let res of results) {
        res.ingestType = 'google';
        res.googleItem = res;
      }
      this.googleSearchResults = results
      this.ref.markForCheck();
    });
  }

  ngOnDestroy() {
    if (this.subscription)
      this.subscription.unsubscribe();
  }

  drop(event: CdkDragDrop<any>) {
    console.log('Previous results: ', this.googleSearchResults);
    let newResults: GoogleSearchItemModel = this.canvasDropService.drop(event);
    console.log('New results: ', newResults);
    this.googleSearchResults = [...this.googleSearchResults];
    console.log('Updated results: ', this.googleSearchResults);
  }

  displayContextPopup(item: GoogleSearchItemModel): void {
    const dialogRef = this.dialog.open(SearchResultsDialogComponent, {
      width: '70%',
      data: item
    });

    dialogRef.afterClosed().subscribe(result => {
      this.ref.markForCheck();
      console.log('Dialog was closed with result: ', result);
    })
  }

  clearResults() {
    this.googleSearchResults = [];
  }
}
