/**
 Copyright 2022 Rob Royce

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


import {Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild} from '@angular/core';
import {KnowledgeSource} from "src/app/models/knowledge.source.model";
import {MenuItem, SortEvent} from "primeng/api";
import {Table} from "primeng/table";
import {KsCommandService} from "../../../services/command-services/ks-command.service";
import {ProjectService} from "../../../services/factory-services/project.service";
import {OverlayPanel} from "primeng/overlaypanel";
import {BrowserViewDialogService} from "../../../services/ipc-services/browser-view-dialog.service";
import {KsFactoryService} from "../../../services/factory-services/ks-factory.service";
import {SettingsService} from "../../../services/ipc-services/settings.service";
import {KsContextMenuService} from "../../../services/factory-services/ks-context-menu.service";

@Component({
  selector: 'ks-table',
  templateUrl: './knowledge-source-table.component.html',
  styleUrls: ['./knowledge-source-table.component.scss']
})
export class KnowledgeSourceTableComponent implements OnInit, OnChanges {
  @Input() ksList: KnowledgeSource[] = [];

  @ViewChild('dataTable') dataTable!: Table;

  @ViewChild('op') overlayPanel!: OverlayPanel;

  @ViewChild('tableFilter') tableFilter!: ElementRef;

  readonly KS_TABLE_ROWS = 'ks-table-rows';

  readonly KS_TABLE_SELECTED_COLUMNS_STATE_KEY = 'ks-table-selected-columns';

  readonly KS_TABLE_SUPPORTED_COLUMNS: { field: string, header: string }[] = [
    {field: 'icon', header: ''}, {field: 'title', header: 'Title'},
    {field: 'associatedProject', header: 'Project'}, {field: 'dateDue', header: 'Due Date'},
    {field: 'dateCreated', header: 'Created'}, {field: 'dateAccessed', header: 'Accessed'},
    {field: 'dateModified', header: 'Modified'}, {field: 'ingestType', header: 'Type'},
    {field: 'flagged', header: 'Important'}
  ];

  ksTableAllowSubprojectExpansion: boolean = true;

  filter: string = '';

  ksSelected: KnowledgeSource[] = [];

  ksTableShouldExist: boolean = true;

  ksTableContextMenuSelectedKs?: KnowledgeSource;

  ksMenuItems: MenuItem[] = [];

  ksTableShowCountdownInsteadOfDates: boolean = true;

  ksTableGlobalFilterFields: string[] = ['title', 'ingestType', 'description', 'associatedProject', 'rawText', 'icon', 'accessLink', 'topics', 'snippet', 'note', 'authors'];

  ksTopics: string[] = [];

  rows: number = 10;

  first: number = 0;

  constructor(private ksCommandService: KsCommandService, private ksFactory: KsFactoryService,
              private projectService: ProjectService, private browserService: BrowserViewDialogService,
              private settingsService: SettingsService, private ksContextMenuService: KsContextMenuService) {
    settingsService.app.subscribe((appSettings) => {
      if (appSettings.table?.showCountdown !== undefined) {
        this.ksTableShowCountdownInsteadOfDates = appSettings.table.showCountdown;
      }
      if (appSettings.table?.showSubProjects !== undefined) {
        this.ksTableAllowSubprojectExpansion = appSettings.table.showSubProjects;
      }
    });
  }

  private _selectedColumns: any[] = this.KS_TABLE_SUPPORTED_COLUMNS;

  get selectedColumns(): any[] {
    return this._selectedColumns;
  }

  set selectedColumns(val: any[]) {
    this._selectedColumns = this.KS_TABLE_SUPPORTED_COLUMNS.filter(col => val.includes(col));
  }

  ngOnInit(): void {
    let sel = localStorage.getItem(this.KS_TABLE_SELECTED_COLUMNS_STATE_KEY)
    if (sel) {
      this._selectedColumns = JSON.parse(sel);
    }

    let rows = localStorage.getItem(`${this.KS_TABLE_ROWS}`);
    if (rows) {
      this.rows = parseInt(rows);
    } else {
      localStorage.setItem(this.KS_TABLE_ROWS, `${this.rows}`);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.ksList) {
      this.ksSelected = [];
      this.ksTopics = [];
      this.ksList.forEach((ks) => {
        ks.topics?.forEach((topic) => {
          if (!this.ksTopics.includes(topic)) {
            this.ksTopics.push(topic);
          }
        });

        this.ksTopics.sort((a, b) => {
          let nA = this.ksList.filter(k => k.topics?.includes(a)).length;
          let nB = this.ksList.filter(k => k.topics?.includes(b)).length;
          return (nA < nB) ? 1 : (nA > nB) ? -1 : 0;
        })
      })
    }
  }

  @HostListener('document:keydown.Control.f')
  @HostListener('document:keydown.meta.f')
  focusFilter() {
    this.tableFilter.nativeElement.focus();
    this.first = this.first + this.rows;
  }

  @HostListener('document:keydown.Control.]')
  @HostListener('document:keydown.meta.]')
  keyPressNext() {
    const next = this.first + this.rows;
    if (next < this.ksList.length) {
      this.first = this.first + this.rows;
    }
    this.dataTable.resetScrollTop();
  }

  @HostListener('document:keydown.Control.[')
  @HostListener('document:keydown.meta.[')
  keyPressPrevious() {
    this.first = Math.max(0, this.first - this.rows);
    this.dataTable.resetScrollTop();
  }

  tableSort(event: SortEvent) {
    if (!event.data) {
      return;
    }

    switch (event.field) {
      case 'associatedProject':
        event.data.sort((d1, d2) => {
          if (!event.field || !event.order) {
            return 0;
          }
          let p1 = this.projectService.getProject(d1[event.field].value)?.name;
          let p2 = this.projectService.getProject(d2[event.field].value)?.name;
          return this.ksSortText(p1 ?? '', p2 ?? '', event.order);
        });
        break;
      case 'dateCreated':
      case 'dateDue':
        event.data.sort((d1, d2) => {
          if (!event.field || !event.order) {
            return 0;
          }
          return this.ksSortDate(d1[event.field], d2[event.field], event.order);
        });
        break;
      case 'dateAccessed':
      case 'dateModified':
        // Sort date data
        event.data.sort((d1, d2) => {
          if (!event.field || !event.order) {
            return 0;
          }
          return this.ksSortDate(
            d1[event.field][d1[event.field].length - 1],
            d2[event.field][d2[event.field].length - 1],
            event.order);
        });
        break;
      default:
        // Sort text data
        event.data.sort((d1, d2) => {
          if (!event.field || !event.order) {
            return 0;
          }
          return this.ksSortText(d1[event.field], d2[event.field], event.order);
        });
    }
  }

  ksSortText(s1: string, s2: string, order: number) {
    return order * (s1 > s2 ? 1 : s1 < s2 ? -1 : 0);
  }

  ksSortDate(d1: Date, d2: Date, order: number) {
    let result: number;
    if (!d1 && !d2) {
      result = 0;
    } else if (!d1) {
      result = order;
    } else if (!d2) {
      result = -order;
    } else {
      result = d1 > d2 ? 1 : d1 < d2 ? -1 : 0
    }
    return order * result;
  }

  removeMultiple(selectedCheckboxKs: KnowledgeSource[]) {
    this.ksCommandService.remove(selectedCheckboxKs);
    this.ksSelected = [];
  }

  getColWidth(col: any): string {
    if (col.field.includes('date')) {
      if (this.ksTableShowCountdownInsteadOfDates) {
        return '7rem';
      } else {
        return '8rem';
      }
    }
    if (col.field === 'ingestType') {
      return '4rem';
    }
    if (col.field === 'flagged') {
      return '7rem';
    }
    if (col.field === 'associatedProject') {
      return '12rem';
    }
    if (col.field === 'topics') {
      return '48rem';
    }
    if (col.field === 'icon') {
      return '40px';
    }
    return 'auto';
  }

  clearFilter(table: Table, filter: HTMLInputElement) {
    table.clear();
    filter.value = '';
  }

  onDragStart($event: DragEvent, ks: KnowledgeSource) {
    $event.preventDefault();
    if (ks.ingestType === 'file') {
      window.electron.startDrag(ks);
    }
  }

  onKsContextMenu() {
    if (this.ksTableContextMenuSelectedKs) {
      this.ksMenuItems = this.ksContextMenuService.generate(this.ksTableContextMenuSelectedKs, this.ksSelected);
    }
  }

  detail(rowData: KnowledgeSource) {
    this.ksCommandService.detail(rowData);
  }

  resetLayout() {
    this.ksTableShouldExist = false;

    // Clear table state
    this.dataTable.clearState();

    setTimeout(() => {
      this.ksTableShouldExist = true;
    });
    this.overlayPanel.hide();
  }

  pastDue(date: Date) {
    return new Date > date;
  }

  onSelectedColumnChange($event: any) {
    localStorage.setItem(this.KS_TABLE_SELECTED_COLUMNS_STATE_KEY, JSON.stringify($event.value));
    this._selectedColumns = $event.value;
    this.dataTable.clearState();
  }

  /**
   * Opens a new search dialog using the topic as its search term.
   * Compatible with PrimeNG `p-chip` and `p-chips`.
   * @param topic A string representing the topic to be searched,
   * or EventEmitter event such that event.value contains a topic string
   */
  onChipClick(topic: any | string) {
    let searchValue: string;
    if (typeof topic === 'string') {
      searchValue = topic.trim();
    } else {
      topic.preventDefault();
      topic.stopPropagation();
      if (!topic.value || typeof topic.value !== 'string') {
        return;
      }
      searchValue = topic.value.trim();
    }
    if (!topic.length) {
      console.warn('Topic appears to have no content.');
      return;
    }
    let ks = this.ksFactory.searchKS(searchValue);
    this.browserService.open({ks: ks});
  }

  ksFlagUpdate(event: any, ks: KnowledgeSource) {
    this.ksCommandService.update([ks]);
  }

  ksTableTopicCount(topic: string) {
    return `${this.ksList.filter(k => k.topics?.includes(topic)).length}`;
  }

  onShowSubprojects($event: any) {
    const show = $event.checked;
    this.settingsService.set({app: {table: {showSubProjects: show}}});
  }

  onShowCountdown($event: any) {
    const show = $event.checked;
    this.settingsService.set({app: {table: {showCountdown: show}}});
  }

  onRowChange($event: number) {
    localStorage.setItem(this.KS_TABLE_ROWS, `${$event}`);
  }
}
