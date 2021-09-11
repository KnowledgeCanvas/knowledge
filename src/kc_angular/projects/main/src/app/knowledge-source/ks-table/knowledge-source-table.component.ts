import {Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {ProjectService} from "../../../../../ks-lib/src/lib/services/projects/project.service";
import {ProjectModel, ProjectUpdateRequest} from "projects/ks-lib/src/lib/models/project.model";
import {IngestType, KnowledgeSource} from "projects/ks-lib/src/lib/models/knowledge.source.model";
import {KcDialogRequest, KcDialogService} from "../../../../../ks-lib/src/lib/services/dialog/kc-dialog.service";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {MatSort, Sort} from "@angular/material/sort";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {Subscription} from "rxjs";
import {Clipboard} from "@angular/cdk/clipboard";
import {MatSnackBar} from "@angular/material/snack-bar";
import {BrowserViewDialogService} from "../../../../../ks-lib/src/lib/services/browser-view-dialog/browser-view-dialog.service";
import {UuidModel} from "../../../../../ks-lib/src/lib/models/uuid.model";

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
export class KnowledgeSourceTableComponent implements OnInit, OnDestroy, OnChanges {
  @Input() project: ProjectModel | undefined;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  knowledgeSource: KnowledgeSource[] = [];
  dataSource: MatTableDataSource<KnowledgeSource>;
  columnsToDisplay: string[] = ['icon', 'title', 'dateCreated', 'dateModified', 'ingestType', 'actions'];
  expandedElement: KnowledgeSource | null = null;
  subscription?: Subscription;
  hideTable: boolean;
  filter: string = '';


  constructor(private browserViewDialogService: BrowserViewDialogService,
              private projectService: ProjectService,
              private confirmDialog: KcDialogService,
              private dialogService: KcDialogService,
              private snackbar: MatSnackBar,
              private clipboard: Clipboard) {
    this.dataSource = new MatTableDataSource<KnowledgeSource>([])
    this.hideTable = true;
  }

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges) {
    let project = changes.project.currentValue;
    if (!project || !project.id) {
      console.error('Expected project but received: ', project);
      return;
    }

    if (changes.project.firstChange) {
      setTimeout(() => {
        this.update(project);
      })
    } else {
      this.update(project);
    }
  }

  update(project: ProjectModel) {
    if (project.knowledgeSource && project.knowledgeSource.length > 0) {
      this.dataSource = new MatTableDataSource<KnowledgeSource>(project.knowledgeSource);
    } else {
      this.dataSource = new MatTableDataSource<KnowledgeSource>([]);
    }

    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    // Ignore case if the column values are strings. Otherwise X, Y, Z appears before a, b, c, etc...
    this.dataSource.sortingDataAccessor = (data: any, sortHeaderId: string): string => {
      if (typeof data[sortHeaderId] === 'string') {
        return data[sortHeaderId].toLocaleLowerCase();
      }
      return data[sortHeaderId];
    }

    setTimeout(() => {
      this.hideTable = this.dataSource.data.length === 0;
    })
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  iconFromIngestType(type: IngestType): string {
    switch (type) {
      case "topic":
        return 'topic';
      case "website":
        return 'web';
      case "search":
        return 'web';
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

  open(ks: KnowledgeSource) {
    window.open(typeof ks.accessLink === 'string' ? ks.accessLink : ks.accessLink.href);
  }

  openKC(ks: KnowledgeSource) {
    this.browserViewDialogService.open({ks: ks});
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
}
