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

import {Component, EventEmitter, HostListener, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild} from '@angular/core';
import {ProjectService} from "../../../../../ks-lib/src/lib/services/projects/project.service";
import {IngestType, KnowledgeSource} from "projects/ks-lib/src/lib/models/knowledge.source.model";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {MatSort} from "@angular/material/sort";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {BrowserViewDialogService} from "../../../../../ks-lib/src/lib/services/browser-view-dialog/browser-view-dialog.service";
import {MatSlideToggleChange} from "@angular/material/slide-toggle";
import {KsInfoDialogService} from "../../../../../ks-lib/src/lib/services/ks-info-dialog.service";

@Component({
  selector: 'ks-table',
  templateUrl: './knowledge-source-table.component.html',
  styleUrls: ['./knowledge-source-table.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class KnowledgeSourceTableComponent implements OnInit, OnChanges {
  @Input() ksList: KnowledgeSource[] = [];
  @Input() ksTableAllowSubprojectExpansion: boolean = true;
  @Output() ksTableShowSubprojects = new EventEmitter<boolean>();
  @Output() ksTablePreviewClicked = new EventEmitter<KnowledgeSource>();
  @Output() ksTableOpenClicked = new EventEmitter<KnowledgeSource>();
  @Output() ksTableShowFileClicked = new EventEmitter<KnowledgeSource>();
  @Output() ksTableCopyLinkClicked = new EventEmitter<KnowledgeSource>();
  @Output() ksTableEditClicked = new EventEmitter<KnowledgeSource>();
  @Output() ksTableRemoveClicked = new EventEmitter<KnowledgeSource>();
  @Output() kcSetCurrentProject = new EventEmitter<string>();
  @Output() ksModified = new EventEmitter<KnowledgeSource>();
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  dataSource: MatTableDataSource<KnowledgeSource>;
  expandedElement: string | null = null;
  hideTable: boolean;
  filter: string = '';
  truncateLength: number = 100;
  showSubProjects: boolean = false;
  pageSize: number = 5;
  rightClickMenuPositionX: number = 0;
  rightClickMenuPositionY: number = 0;
  isDisplayContextMenu: boolean = false;
  ksForContextMenu?: KnowledgeSource;
  columnsToDisplay: string[] = ['icon', 'title', 'dateCreated', 'dateAccessed', 'dateModified', 'ingestType'];
  private initialDisplayedColumns: string[] = ['icon', 'title', 'dateCreated', 'dateAccessed', 'dateModified', 'ingestType'];
  private initialDisplayedColumnsWithInheritance: string[] = ['icon', 'title', 'associatedProjects', 'dateCreated', 'dateAccessed', 'dateModified', 'ingestType'];

  constructor(private browserViewDialogService: BrowserViewDialogService,
              private ksInfoDialogService: KsInfoDialogService,
              private projectService: ProjectService) {
    this.dataSource = new MatTableDataSource<KnowledgeSource>([])
    this.hideTable = true;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.setTableColumnsByScreenWidth(event.target.innerWidth);
  }

  @HostListener('document:click')
  documentClick(): void {
    this.isDisplayContextMenu = false;
  }

  ngOnInit(): void {
    this.setTableColumnsByScreenWidth(window.innerWidth);
  }

  ngOnChanges(changes: SimpleChanges) {
    this.update();
  }

  setTableColumnsByScreenWidth(width: number) {
    if (width > 1000) {
      this.columnsToDisplay = this.showSubProjects
        ? this.initialDisplayedColumnsWithInheritance : this.initialDisplayedColumns;
      this.truncateLength = 50;
    } else if (width > 900) {
      this.columnsToDisplay = this.showSubProjects
        ? this.initialDisplayedColumnsWithInheritance.filter(c => c !== 'dateCreated' && c !== 'dateAccessed')
        : this.initialDisplayedColumns.filter(c => c !== 'dateCreated' && c !== 'dateAccessed');
      this.truncateLength = 40;
    } else {
      this.truncateLength = 30;
      this.columnsToDisplay = this.showSubProjects
        ? this.initialDisplayedColumnsWithInheritance.filter(c => c !== 'dateCreated' && c !== 'dateModified' && c !== 'dateAccessed')
        : this.initialDisplayedColumns.filter(c => c !== 'dateCreated' && c !== 'dateModified' && c !== 'dateAccessed');
    }
  }

  async update() {
    this.hideTable = true;
    this.filter = '';
    this.dataSource = new MatTableDataSource<KnowledgeSource>(this.ksList);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.setSortingAccessor();
    this.setTableColumnsByScreenWidth(window.innerWidth);
    this.hideTable = this.dataSource.data.length === 0;
  }

  setSortingAccessor() {
    this.dataSource.sortingDataAccessor = (data: any, sortHeaderId: string): string => {
      if (sortHeaderId === 'associatedProjects') {
        return this.projectNameFromId(data[sortHeaderId][0].value);
      }

      // Make sure dates show up in proper numerical order
      if (sortHeaderId === 'dateCreated' || sortHeaderId === 'dateModified' || sortHeaderId === 'dateAccessed') {
        return new Date(data[sortHeaderId]).valueOf().toString();
      }

      // Make sure strings are case insensitive
      if (typeof data[sortHeaderId] === 'string') {
        return data[sortHeaderId].toLocaleLowerCase();
      }

      // Otherwise, no custom sort order needed
      return data[sortHeaderId];
    }
  }

  iconFromIngestType(type: IngestType): string {
    switch (type) {
      case "topic":
        return 'topic';
      case "website":
        return 'web';
      case "search":
        return 'travel_explore';
      case "file":
        return 'description';
      case "google":
        return 'travel_explore';
      default:
        return '';
    }
  }

  applyFilter($event: KeyboardEvent | string) {
    if (typeof $event === 'string') {
      this.dataSource.filter = $event.trim().toLowerCase();
      this.filter = $event;
    } else {
      const filterValue = ($event.target as HTMLInputElement).value;
      this.dataSource.filter = filterValue.trim().toLowerCase();
    }
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  ksRowClicked(ks: KnowledgeSource) {
    this.expandedElement = this.expandedElement === ks.id.value ? null : ks.id.value;
  }

  onShowSubProjectsClicked(toggle: MatSlideToggleChange) {
    this.showSubProjects = toggle.checked;
  }

  projectNameFromId(id: string): string {
    let p = this.projectService.getProject(id);
    if (p)
      return p.name;
    else
      return '';
  }

  setActiveProject(id: string | KnowledgeSource) {
    if (typeof id === 'string')
      this.kcSetCurrentProject.emit(id);
    else
      if (id.associatedProjects && id.associatedProjects[0]) {
        this.kcSetCurrentProject.emit(id.associatedProjects[0].value);
      }
  }

  show(element: KnowledgeSource) {
    this.ksTableShowFileClicked.emit(element);
  }

  openContextMenu($event: MouseEvent, ks: KnowledgeSource) {
    this.ksForContextMenu = ks;
    this.rightClickMenuPositionX = $event.clientX;
    this.rightClickMenuPositionY = $event.clientY;
    this.isDisplayContextMenu = true;
  }

  getRightClickMenuStyle() {
    return {
      position: 'fixed',
      left: `${this.rightClickMenuPositionX}px`,
      top: `${this.rightClickMenuPositionY}px`
    }
  }
}
