import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {CdkDragDrop} from "@angular/cdk/drag-drop";
import {KsDropService} from "../../../../../ks-lib/src/lib/services/ks-drop/ks-drop.service";
import {MatDialog} from "@angular/material/dialog";
import {ProjectModel, ProjectUpdateRequest} from "projects/ks-lib/src/lib/models/project.model";
import {ProjectService} from "../../../../../ks-lib/src/lib/services/projects/project.service";
import {KnowledgeSource} from "projects/ks-lib/src/lib/models/knowledge.source.model";
import {KnowledgeSourceImportDialogComponent, KsImportDialogOutput} from "../ks-import-dialog/knowledge-source-import-dialog.component";
import {KsInfoDialogComponent, KsInfoDialogInput, KsInfoDialogOutput} from "../ks-info-dialog/ks-info-dialog.component";
import {FaviconExtractorService} from "../../../../../ks-lib/src/lib/services/favicon/favicon-extractor.service";
import {StorageService} from "../../../../../ks-lib/src/lib/services/storage/storage.service";
import {KsFactoryService} from "../../../../../ks-lib/src/lib/services/ks-factory/ks-factory.service";
import {BrowserViewDialogService} from "../../../../../ks-lib/src/lib/services/browser-view-dialog/browser-view-dialog.service";
import {Subscription} from "rxjs";
import {KsQueueService} from "../ks-queue-service/ks-queue.service";

export interface KsSortBy {
  index: number;
  key: string,
  label: string,
  tooltip: string
}

@Component({
  selector: 'app-canvas-source-list',
  templateUrl: './knowledge-source-drop-list.component.html',
  styleUrls: ['./knowledge-source-drop-list.component.scss']
})
export class KnowledgeSourceDropListComponent implements OnInit, OnDestroy {
  @ViewChild('ksSortKey') ksSortKeyElementRef: ElementRef = {} as ElementRef;
  project: ProjectModel | null = null;
  ksList: KnowledgeSource[] = [];
  hideSortHeader: boolean = true;
  tooltip: string = '';
  CONTAINER_ID = 'knowledge-canvas-sidebar';
  private sortByIndex = 0;
  private subscription: Subscription | null = null;

  // TODO: Ideally each KS could also be sorted by rating
  private sortByList: KsSortBy[] = [
    {
      index: 0,
      key: 'az',
      label: 'A-Z',
      tooltip: 'Alphabetical order - ascending'
    },
    {
      index: 1,
      key: 'za',
      label: 'Z-A',
      tooltip: 'Alphabetical order - descending silly'
    },
    {
      index: 2,
      key: 'modified',
      label: 'Changed',
      tooltip: 'Changed (modified) - Most recent at top'
    },
    {
      index: 3,
      key: 'accessed',
      label: 'Review',
      tooltip: 'Reviewed (accessed) - Least recent at top'
    },
    {
      index: 4,
      key: 'created',
      label: 'Created',
      tooltip: 'Created - Most recent at top'
    }
  ];

  constructor(private browserViewDialogService: BrowserViewDialogService,
              private faviconService: FaviconExtractorService,
              private ksDropService: KsDropService,
              private ksQueueService: KsQueueService,
              private projectService: ProjectService,
              private storageService: StorageService,
              private ksFactory: KsFactoryService,
              private dialog: MatDialog) {
  }

  ngOnInit(): void {
    this.subscription = this.projectService.currentProject.subscribe(project => {
      // Update project when necessary
      this.project = null;
      this.ksList = [];
      if (!project || !project.name || project.id.value === '') {
        return;
      }
      this.project = project;

      // Update knowledge source list when necessary
      if (!project.knowledgeSource || project.knowledgeSource.length <= 0) {
        this.ksList = [];
        this.hideSortHeader = true;
        return;
      }

      // Prepare KS list for display by gathering icons
      let newList: KnowledgeSource[] = [];
      let faviconRequests = [];

      for (let ks of project.knowledgeSource) {
        if (!ks.iconUrl) {
          // TODO: change file favicon from current PDF icon...
          if (ks.ingestType === 'file')
            ks.iconUrl = this.faviconService.file();
          else
            ks.iconUrl = this.faviconService.generic();
        }

        faviconRequests.push(ks.iconUrl);

        if (ks.ingestType !== 'file')
          ks.icon = this.faviconService.loading();

        newList.push(ks);
      }

      this.faviconService.extract(faviconRequests).then((icons) => {
        if (!project.knowledgeSource) {
          let err = 'Critical error occurred while requesting favicons for KS models.';
          console.error(err);
          throw new Error(err);
        }

        for (let i = 0; i < project.knowledgeSource.length; i++) {
          let ks = newList[i];
          if (ks.ingestType !== 'file')
            ks.icon = icons[i];
        }

        this.ksList = newList;
        this.sortByIndex = this.storageService.sortByIndex || 0;
        this.performSort();
        this.hideSortHeader = this.ksList.length <= 1;
      });
    });
  }

  ngOnDestroy() {
    if (this.subscription)
      this.subscription.unsubscribe();
  }

  addKsToProject(ks: KnowledgeSource) {
    // Make sure there is an active project for redundancy
    if (!this.project) {
      console.error('KS List - Error adding new source to project: ', this.project);
      return;
    }

    // If the project has a KS list, check if the new KS already exists. If it does, ignore...
    if (this.project.knowledgeSource && this.project.knowledgeSource.length > 0) {
      let found = this.project.knowledgeSource.find(k => k.id.value === ks.id.value);
      if (found) {
        console.warn('Attempting to add duplicate KS to project');
        return;
      }
    }
    let update: ProjectUpdateRequest = {
      id: this.project.id,
      addKnowledgeSource: [ks]
    }
    this.projectService.updateProject(update);

  }

  onKsDropEvent($event: CdkDragDrop<any>) {
    this.ksDropService.drop($event);

    // Updates are not propagated unless we do this
    this.ksList = [...this.ksList];

    // The Queue Service must be updated because the Drop Service isn't listening to these events
    this.ksQueueService.remove($event.item.data);

    // If the dropped item is coming from a different list, save it to the project immediately
    if ($event.previousContainer !== $event.container) {
      this.addKsToProject($event.item.data);
    }

    this.performSort();
  }

  openKsImportDialog() {
    const dialogRef = this.dialog.open(KnowledgeSourceImportDialogComponent, {
      width: 'auto',
      minWidth: '512px',
      maxWidth: '1024px',
      maxHeight: '80vh',
      data: this.project
    });

    dialogRef.afterClosed().subscribe((output: KsImportDialogOutput) => {
      if (output && output.ingestType === 'search') {
        this.openSearchBrowserView();
      }
    })
  }

  openSearchBrowserView() {
    let searchKS = this.ksFactory.searchKS();
    const dialogRef = this.browserViewDialogService.open({ks: searchKS});
  }

  openKsInfoDialog(node: KnowledgeSource) {
    let dialogInput: KsInfoDialogInput = {
      source: 'ks-drop-list',
      ks: node,
      projectId: this.project ? this.project.id.value : undefined
    }

    const dialogRef = this.dialog.open(KsInfoDialogComponent, {
      minWidth: '65vw',
      width: 'auto',
      height: 'auto',
      maxHeight: '90vh',
      data: dialogInput,
      autoFocus: false
    });
    dialogRef.afterClosed().subscribe((result: KsInfoDialogOutput) => {
      if (result.ksChanged && this.project) {
        let update: ProjectUpdateRequest = {
          id: this.project.id,
          updateKnowledgeSource: [result.ks]
        }
        console.log('Reulting KS: ', result.ks);
        this.projectService.updateProject(update);
      }

      if (result.preview) {
        // TODO: open ks-preview dialog here
        this.preview(result.ks);
      }
    })
  }

  preview(ks: KnowledgeSource) {
    let dialogRef = this.browserViewDialogService.open({ks: ks});
    dialogRef.afterClosed().subscribe((results) => {
      // TODO: update KS with new timestamps (accessed, modified if necessary)
    });
  }

  sortPrevious() {
    this.sortByIndex = this.sortByIndex === 0 ? this.sortByList.length - 1 : this.sortByIndex - 1;
    this.performSort();
  }

  sortNext() {
    this.sortByIndex = this.sortByIndex === this.sortByList.length - 1 ? 0 : this.sortByIndex + 1;
    this.performSort();
  }

  getKsTooltip(node: KnowledgeSource) {
    switch (this.sortByIndex) {
      case 2: // Modified
        return `${node.title} - Changed ${new Date(node.dateModified).toDateString()}`;
      case 3: // Accessed
        return `${node.title} - Reviewed ${new Date(node.dateAccessed).toDateString()}`;
      case 4: // Created
        return `${node.title} - Created ${new Date(node.dateCreated).toDateString()}`;
      default: // A-Z, Z-A
        return node.title;
    }
  }

  private performSort() {
    let key = this.sortByList[this.sortByIndex];
    switch (key.key) {
      case 'az':
        this.sortByTitle('ascending');
        break;
      case 'za':
        this.sortByTitle('descending');
        break;
      case 'modified':
        this.sortByDate(key.key);
        break;
      case 'accessed':
        this.sortByDate(key.key);
        break;
      case 'created':
        this.sortByDate(key.key);
        break;
    }

    this.ksSortKeyElementRef.nativeElement.innerText = key.label
    this.tooltip = key.tooltip;
    this.sortByIndex = key.index;
    this.storageService.sortByIndex = key.index;
  }

  private sortByTitle(order: 'ascending' | 'descending') {
    if (order === 'ascending')
      this.ksList.sort((a, b) => {
        if (a.title.toLowerCase() < b.title.toLowerCase()) return -1;
        if (a.title.toLowerCase() > b.title.toLowerCase()) return 1;
        else return 0;
      });
    if (order === 'descending')
      this.ksList.sort((a, b) => {
        if (a.title.toLowerCase() > b.title.toLowerCase()) return -1;
        if (a.title.toLowerCase() < b.title.toLowerCase()) return 1;
        else return 0;
      });
  }

  private sortByDate(date: 'accessed' | 'created' | 'modified') {
    if (date === 'accessed')
      this.ksList.sort((a, b) => {
        if (a.dateAccessed.getTime() < b.dateAccessed.getTime()) return -1;
        if (a.dateAccessed.getTime() > b.dateAccessed.getTime()) return 1;
        else return 0;
      });
    if (date === 'created')
      this.ksList.sort((a, b) => {
        if (a.dateCreated.getTime() > b.dateCreated.getTime()) return -1;
        if (a.dateCreated.getTime() < b.dateCreated.getTime()) return 1;
        else return 0;
      });
    if (date === 'modified')
      this.ksList.sort((a, b) => {
        if (a.dateModified.getTime() > b.dateModified.getTime()) return -1;
        if (a.dateModified.getTime() < b.dateModified.getTime()) return 1;
        else return 0;
      });
  }
}
