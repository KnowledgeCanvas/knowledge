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

import {AfterViewInit, Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {ProjectService} from "../../../../../ks-lib/src/lib/services/projects/project.service";
import {ProjectModel} from "projects/ks-lib/src/lib/models/project.model";
import {IngestType, KnowledgeSource} from "projects/ks-lib/src/lib/models/knowledge.source.model";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {MatSort} from "@angular/material/sort";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {Subscription} from "rxjs";
import {BrowserViewDialogService} from "../../../../../ks-lib/src/lib/services/browser-view-dialog/browser-view-dialog.service";
import {MatSlideToggleChange} from "@angular/material/slide-toggle";
import {FaviconExtractorService} from "../../../../../ks-lib/src/lib/services/favicon/favicon-extractor.service";
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
export class KnowledgeSourceTableComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() ksList: KnowledgeSource[] = [];
  @Input() ksTableAllowSubprojectExpansion: boolean = true;
  @Output() ksTableShowSubprojects = new EventEmitter<boolean>();
  @Output() ksTablePreviewClicked = new EventEmitter<KnowledgeSource>();
  @Output() ksTableOpenClicked = new EventEmitter<KnowledgeSource>();
  @Output() ksTableShowFileClicked = new EventEmitter<KnowledgeSource>();
  @Output() ksTableCopyLinkClicked = new EventEmitter<KnowledgeSource>();
  @Output() ksTableEditClicked = new EventEmitter<KnowledgeSource>();
  @Output() ksTableRemoveClicked = new EventEmitter<KnowledgeSource>();
  @Output() ksModified = new EventEmitter<KnowledgeSource>();
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  project?: ProjectModel;
  dataSource: MatTableDataSource<KnowledgeSource>;
  expandedElement: KnowledgeSource | null = null;
  subscription?: Subscription;
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
              private faviconService: FaviconExtractorService,
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
    this.projectService.currentProject.subscribe((project: ProjectModel) => {
      this.project = project;
      this.update(project);
    });

    setTimeout(() => {
      if (this.project)
        this.update(this.project)
    });
  }

  ngAfterViewInit() {
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

  async update(project: ProjectModel) {
    if (project.id.value !== this.project?.id.value) {
      this.showSubProjects = false;
    }

    this.hideTable = true;
    this.dataSource = new MatTableDataSource<KnowledgeSource>([]);
    this.filter = '';

    let ksList: KnowledgeSource[] = [];

    if (project.knowledgeSource) {
      for (let ks of project.knowledgeSource) {
        ks.icon = this.faviconService.loading();
        ks.associatedProjects = ks.associatedProjects ? ks.associatedProjects : [project.id];
        ksList.push(ks);
      }
    }

    if (this.showSubProjects && project.subprojects && project.subprojects.length > 0) {

      // Get all of the Knowledge Sources from sub projects...
      const subTrees = this.projectService.getSubTree(project.id.value);

      for (let subTree of subTrees) {
        // Ignore current project...
        if (subTree.id === project.id.value)
          continue;

        let subProject = this.projectService.getProject(subTree.id);

        if (!subProject || !subProject.knowledgeSource || subProject.knowledgeSource.length === 0)
          continue;

        for (let ks of subProject.knowledgeSource) {
          ks.icon = this.faviconService.loading();
          ks.associatedProjects = ks.associatedProjects ? ks.associatedProjects : [subProject.id];
          ksList.push(ks);
        }
      }
    }

    this.faviconService.extractFromKsList(ksList).then((list) => {
      ksList = list;
    });

    this.dataSource = new MatTableDataSource<KnowledgeSource>(ksList);

    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.setSortingAccessor();
    this.setTableColumnsByScreenWidth(window.innerWidth);
    this.hideTable = this.dataSource.data.length === 0;
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
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
    this.expandedElement = this.expandedElement === ks ? null : ks;
  }

  onShowSubProjectsClicked(toggle: MatSlideToggleChange) {
    this.showSubProjects = toggle.checked;
    if (this.project)
      this.update(this.project);
  }

  projectNameFromId(id: string): string {
    let p = this.projectService.getProject(id);
    if (p)
      return p.name;
    else
      return '';
  }

  setActiveProject(id: string) {
    if (id !== this.project?.id.value)
      this.projectService.setCurrentProject(id);
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
