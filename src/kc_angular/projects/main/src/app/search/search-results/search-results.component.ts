/**
 Copyright 2021 Rob Royce

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */


import {Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges} from '@angular/core';
import {KsDropService} from "../../../../../ks-lib/src/lib/services/ks-drop/ks-drop.service";
import {MatDialog} from "@angular/material/dialog";
import {KnowledgeSource} from "projects/ks-lib/src/lib/models/knowledge.source.model";
import {KsInfoDialogComponent, KsInfoDialogInput, KsInfoDialogOutput} from "../../knowledge-source/ks-info-dialog/ks-info-dialog.component";
import {BrowserViewDialogService} from "../../../../../ks-lib/src/lib/services/browser-view-dialog/browser-view-dialog.service";
import {animate, style, transition, trigger} from "@angular/animations";

@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.scss'],
  animations: [
    trigger(
      'searchBarAnimation', [
        transition(
          ':enter', [
            style({height: 0, opacity: 0}),
            animate('250ms ease-out',
              style({height: 99, opacity: 1}))
          ]
        ),
        transition(
          ':leave', [
            style({height: 99, opacity: 1}),
            animate('250ms ease-in',
              style({height: 0, opacity: 0}))
          ]
        )
      ]
    )
  ]
})
export class SearchResultsComponent implements OnInit, OnChanges, OnDestroy {
  ksListId = 'ksQueue';

  @Input()
  ksQueueLoading: boolean = false;

  @Input()
  ksQueue: KnowledgeSource[] = [];

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
      this.ksQueue = changes.ksList.currentValue;
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
        let found = this.ksQueue.find(k => k.id.value === result.ks?.id.value);
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
    this.ksQueue = [];
    this.ksQueueCleared.emit();
  }

  importAll() {
    if (!this.kcProjectId)
      return;

    this.ksImported.emit(this.ksQueue);
    this.clearResults();
  }

  ksSelected($event: KnowledgeSource) {
    this.displayContextPopup($event);
  }

  ksListChanged(ksList: KnowledgeSource[]) {
    this.ksQueue = ksList;
    if (ksList.length === 0) {
      this.ksQueueCleared.emit();
    }
  }

  ksRemovedFromQueue($event: KnowledgeSource) {
    this.ksRemoved.emit($event);
  }
}
