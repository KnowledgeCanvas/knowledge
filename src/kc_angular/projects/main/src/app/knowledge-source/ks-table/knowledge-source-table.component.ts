import {AfterViewInit, Component, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ProjectService} from "../../../../../ks-lib/src/lib/services/projects/project.service";
import {ProjectModel, ProjectUpdateRequest} from "projects/ks-lib/src/lib/models/project.model";
import {IngestType, KnowledgeSource} from "projects/ks-lib/src/lib/models/knowledge.source.model";
import {KcDialogRequest, KcDialogService} from "../../../../../ks-lib/src/lib/services/dialog/kc-dialog.service";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {MatSort} from "@angular/material/sort";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {Subscription} from "rxjs";
import {Clipboard} from "@angular/cdk/clipboard";
import {MatSnackBar} from "@angular/material/snack-bar";
import {BrowserViewDialogService} from "../../../../../ks-lib/src/lib/services/browser-view-dialog/browser-view-dialog.service";
import {MatSlideToggleChange} from "@angular/material/slide-toggle";
import {FaviconExtractorService} from "../../../../../ks-lib/src/lib/services/favicon/favicon-extractor.service";
import {KsInfoDialogService} from "../../../../../ks-lib/src/lib/services/ks-info-dialog.service";

@Component({
  selector: 'app-knowledge-source-table',
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
  // @Input() project: ProjectModel | undefined;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  project?: ProjectModel;
  knowledgeSource: KnowledgeSource[] = [];
  dataSource: MatTableDataSource<KnowledgeSource>;
  columnsToDisplay: string[] = ['icon', 'title', 'dateCreated', 'dateAccessed', 'dateModified', 'ingestType'];
  expandedElement: KnowledgeSource | null = null;
  subscription?: Subscription;
  hideTable: boolean;
  filter: string = '';
  truncateLength: number = 100;
  showSubProjects: boolean = false;
  pageSize: number = 5;
  private initialDisplayedColumns: string[] = ['icon', 'title', 'dateCreated', 'dateAccessed', 'dateModified', 'ingestType'];
  private initialDisplayedColumnsWithInheritance: string[] = ['icon', 'title', 'associatedProjects', 'dateCreated', 'dateAccessed', 'dateModified', 'ingestType'];

  constructor(private browserViewDialogService: BrowserViewDialogService,
              private ksInfoDialogService: KsInfoDialogService,
              private faviconService: FaviconExtractorService,
              private projectService: ProjectService,
              private confirmDialog: KcDialogService,
              private dialogService: KcDialogService,
              private snackbar: MatSnackBar,
              private clipboard: Clipboard) {
    this.dataSource = new MatTableDataSource<KnowledgeSource>([])
    this.hideTable = true;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.setTableColumnsByScreenWidth(event.target.innerWidth);
  }

  ngOnInit(): void {
    this.setTableColumnsByScreenWidth(window.innerWidth);
    this.projectService.currentProject.subscribe((project: ProjectModel) => {
      this.showSubProjects = false;

      if (this.paginator)
        this.paginator.pageSize = 5;

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
      this.truncateLength = 120;
    } else if (width > 900) {
      this.columnsToDisplay = this.showSubProjects
        ? this.initialDisplayedColumnsWithInheritance.filter(c => c !== 'dateCreated' && c !== 'dateAccessed')
        : this.initialDisplayedColumns.filter(c => c !== 'dateCreated' && c !== 'dateAccessed');
      this.truncateLength = 60;
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

  copy(ks: KnowledgeSource) {
    this.clipboard.copy(typeof ks.accessLink === 'string' ? ks.accessLink : ks.accessLink.href);
    this.snackbar.open('Copied to clipboard!', 'Dismiss', {duration: 2000, panelClass: 'kc-success'});
  }

  edit(ks: KnowledgeSource) {
    this.ksInfoDialogService.open(ks, this.project ? this.project.id.value : undefined).then((output) => {
      if (output.ksChanged && this.project) {
        let update: ProjectUpdateRequest = {
          id: this.project.id,
          updateKnowledgeSource: [output.ks]
        }

        this.projectService.updateProject(update);
      }
      if (output.preview) {
        this.preview(output.ks);
      }
    })
  }

  open(ks: KnowledgeSource) {
    window.open(typeof ks.accessLink === 'string' ? ks.accessLink : ks.accessLink.href);
  }

  preview(ks: KnowledgeSource) {
    const dialogRef = this.browserViewDialogService.open({ks: ks});
    dialogRef.componentInstance.output.subscribe((output) => {
      if (!this.project)
        return;

      let ks = output.ks;
      ks.dateAccessed = new Date();

      let update: ProjectUpdateRequest = {
        id: this.project.id,
        updateKnowledgeSource: [ks]
      }

      this.projectService.updateProject(update);
    });
  }

  delete(ks: KnowledgeSource) {
    let confirmDialogConfig: KcDialogRequest = {
      actionButtonText: "Delete Permanently",
      actionToTake: 'delete',
      cancelButtonText: "Cancel",
      listToDisplay: [ks],
      message: "Are you sure you want to delete this Knowledge Source?",
      title: `Delete`

    }
    this.dialogService.open(confirmDialogConfig);
    this.dialogService.confirmed().subscribe((confirmed) => {
      if (confirmed) {
        if (this.project && this.project.id.value !== '') {
          let update: ProjectUpdateRequest = {
            id: this.project.id,
            removeKnowledgeSource: [ks]
          }
          this.projectService.updateProject(update);
        } else {
          console.error(`Attempting to remove ${ks.title} with invalid project id...`);
        }
      }
    })
  }

  rowClicked(element: any) {

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
}
