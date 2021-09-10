import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ProjectService} from "../../../../../ks-lib/src/lib/services/projects/project.service";
import {ProjectModel} from "projects/ks-lib/src/lib/models/project.model";
import {IngestType, KnowledgeSource} from "projects/ks-lib/src/lib/models/knowledge.source.model";
import {KcDialogService} from "../../../../../ks-lib/src/lib/services/dialog/kc-dialog.service";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {MatSort} from "@angular/material/sort";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {Subscription} from "rxjs";

interface KsChecklist {
  title: string;
  checked: boolean;
  id: string;
  type: IngestType
}

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
export class KnowledgeSourceTableComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  project: ProjectModel | null = new ProjectModel('', {value: ''});
  knowledgeSource: KnowledgeSource[] = [];
  dataSource: MatTableDataSource<KnowledgeSource>;
  columnsToDisplay: string[] = ['icon', 'title', 'ingestType', 'actions'];
  expandedElement: KnowledgeSource | null = null;
  subscription?: Subscription;
  hideTable: boolean;
  filter: string = '';


  constructor(private projectService: ProjectService, private dialogService: KcDialogService) {
    this.dataSource = new MatTableDataSource<KnowledgeSource>([])
    this.hideTable = true;
  }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.subscription = this.projectService.currentProject.subscribe((project: ProjectModel) => {
      this.project = project;
      this.filter = '';

      if (project.knowledgeSource && project.knowledgeSource.length > 0) {
        this.dataSource = new MatTableDataSource<KnowledgeSource>(project.knowledgeSource);
      } else {
        this.dataSource = new MatTableDataSource<KnowledgeSource>([]);
      }

      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });

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

  openKs(ks: KsChecklist) {
    console.log('Opening ks: ', ks);
  }

  applyFilter($event: KeyboardEvent) {
    const filterValue = ($event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  copy($event: MouseEvent) {
    $event.preventDefault();
    console.log('Copy: ', $event);
  }

  open($event: MouseEvent) {

  }

  delete($event: MouseEvent) {

  }

  rowClicked(element: any) {
    console.log('Row clicked: ', element);
  }
}
