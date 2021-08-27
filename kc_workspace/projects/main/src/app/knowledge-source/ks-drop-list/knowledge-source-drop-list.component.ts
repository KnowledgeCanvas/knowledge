import {ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {CdkDragDrop} from "@angular/cdk/drag-drop";
import {CanvasDropService} from "../../../../../shared/src/services/canvas-drop/canvas-drop.service";
import {MatDialog} from "@angular/material/dialog";
import {ProjectModel, ProjectUpdateRequest} from "../../../../../shared/src/models/project.model";
import {ProjectService} from "../../../../../shared/src/services/projects/project.service";
import {KnowledgeSource} from "../../../../../shared/src/models/knowledge.source.model";
import {KnowledgeSourceImportDialogComponent} from "../ks-import-dialog/knowledge-source-import-dialog.component";
import {KsInfoDialogComponent} from "../ks-info-dialog/ks-info-dialog.component";
import {FaviconExtractorService} from "../../../../../shared/src/services/favicon/favicon-extractor.service";
import {StorageService} from "../../../../../shared/src/services/storage/storage.service";
import {UuidModel} from "../../../../../shared/src/models/uuid.model";

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
export class KnowledgeSourceDropListComponent implements OnInit {
  @ViewChild('ksSortKey') ksSortKeyElementRef: ElementRef = {} as ElementRef;
  project: ProjectModel | null = null;
  canvasNodes: KnowledgeSource[] = [];
  hideSortHeader: boolean = true;
  tooltip: string = '';
  CONTAINER_ID = 'knowledge-canvas-sidebar';
  private sortByIndex = 0;

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
    },
    {
      index: 5,
      key: 'custom',
      label: 'Custom',
      tooltip: 'Custom (autosave) - Create your own ordering!'
    }
  ];

  constructor(private faviconService: FaviconExtractorService,
              private canvasDropService: CanvasDropService,
              private projectService: ProjectService,
              private storageService: StorageService,
              private ref: ChangeDetectorRef,
              public dialog: MatDialog) {
  }

  ngOnInit(): void {
    this.init();
  }

  init() {
    this.projectService.currentProject.subscribe(project => {
      this.project = null;
      this.canvasNodes = [];

      // TODO: verification of UUID format
      if (!project || !project.name || project.id.value === '') {
        return;
      }
      this.project = project;

      if (!project.knowledgeSource || project.knowledgeSource.length <= 0) {
        this.hideSortHeader = true;
        return;
      }

      for (let source of project.knowledgeSource) {
        if (source.ingestType !== 'file') {
          source.icon = this.faviconService.loading();
          this.faviconService.extract(source.iconUrl).then(icon => source.icon = icon);
        } else {
          source.icon = this.faviconService.file();
        }
        this.canvasNodes.push(source);
        this.hideSortHeader = false;
      }

      // Give @ViewChild time to materialize...
      setTimeout(() => {
        this.sortByIndex = this.storageService.sortByIndex || 0;
        if (this.canvasNodes.length > 0)
          this.sortKsListByIndex();
      });
    });
  }

  drop($event: CdkDragDrop<any>) {
    this.canvasDropService.drop($event);
    this.canvasNodes = [...this.canvasNodes];

    // If the dropped item is coming from a different list, save it to the project immediately
    if (this.project && this.project.id && $event.previousContainer !== $event.container) {
      // Set timestamp based on when the source was actually improted into the system
      $event.item.data.dateCreated = new Date();
      $event.item.data.dateModified = new Date();
      $event.item.data.dateAccessed = new Date();

      // Update the project to persist the new source
      let projectUpdate: ProjectUpdateRequest = {
        id: this.project.id,
        addKnowledgeSource: [$event.item.data]
      }
      this.projectService.updateProject(projectUpdate);
    }

    // If the current sortBy key is 'custom', persist the new ordering
    if (this.sortByIndex === 5) {
      let customIds: UuidModel[] = [];
      for (let ks of this.canvasNodes) {
        customIds.push(ks.id);
      }
      this.storageService.sortByCustom = customIds
    }

    this.sortKsListByIndex();
  }

  displayContextPopup(node: KnowledgeSource) {
    node.sourceRef = 'list';

    const dialogRef = this.dialog.open(KsInfoDialogComponent, {
      width: '70%',
      data: node,
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe(result => {
      this.ref.detectChanges();
      console.log('KS drop list after dialog close: ', result);
      if (result.ksChanged && this.project) {
        this.sortKsListByIndex();

        let update: ProjectUpdateRequest = {
          id: this.project.id,
          updateKnowledgeSource: [result.ks]
        }
        this.projectService.updateProject(update);
      }
    })
  }

  addSource() {
    this.dialog.open(KnowledgeSourceImportDialogComponent, {
      width: '376px',
      data: this.project
    });
  }

  sortPrevious() {
    this.sortByIndex = this.sortByIndex === 0 ? this.sortByList.length - 1 : this.sortByIndex - 1;
    this.sortKsListByIndex();
  }

  sortNext() {
    this.sortByIndex = this.sortByIndex === this.sortByList.length - 1 ? 0 : this.sortByIndex + 1;
    this.sortKsListByIndex();
  }

  private sortKsListByIndex() {
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
      case 'custom':
        this.sortByCustom();
        break;
    }

    this.ksSortKeyElementRef.nativeElement.innerText = key.label
    this.tooltip = key.tooltip;
    this.sortByIndex = key.index;
    this.storageService.sortByIndex = key.index;
  }


  private sortByTitle(order: 'ascending' | 'descending') {
    if (order === 'ascending')
      this.canvasNodes.sort((a, b) => {
        if (a.title.toLowerCase() < b.title.toLowerCase()) return -1;
        if (a.title.toLowerCase() > b.title.toLowerCase()) return 1;
        else return 0;
      });
    if (order === 'descending')
      this.canvasNodes.sort((a, b) => {
        if (a.title.toLowerCase() > b.title.toLowerCase()) return -1;
        if (a.title.toLowerCase() < b.title.toLowerCase()) return 1;
        else return 0;
      });
  }

  private sortByDate(date: 'accessed' | 'created' | 'modified') {
    if (date === 'accessed')
      this.canvasNodes.sort((a, b) => {
        if (a.dateAccessed.getTime() < b.dateAccessed.getTime()) return -1;
        if (a.dateAccessed.getTime() > b.dateAccessed.getTime()) return 1;
        else return 0;
      });
    if (date === 'created')
      this.canvasNodes.sort((a, b) => {
        if (a.dateCreated.getTime() > b.dateCreated.getTime()) return -1;
        if (a.dateCreated.getTime() < b.dateCreated.getTime()) return 1;
        else return 0;
      });
    if (date === 'modified')
      this.canvasNodes.sort((a, b) => {
        if (a.dateModified.getTime() > b.dateModified.getTime()) return -1;
        if (a.dateModified.getTime() < b.dateModified.getTime()) return 1;
        else return 0;
      });
  }

  private sortByCustom() {
    let customIds: UuidModel[] | undefined = this.storageService.sortByCustom;
    if (!customIds || customIds.length !== this.canvasNodes.length) {
      return;
    }

    let newNodes: KnowledgeSource[] = [];
    for (let custom of customIds) {
      let c = this.canvasNodes.find(x => x.id.value === custom.value);
      if (c)
        newNodes.push(c);
    }
    this.canvasNodes = newNodes;
  }

  getKsTooltip(node: KnowledgeSource) {
    switch(this.sortByIndex) {
      case 2: // Modified
        return `${node.title} - Changed ${new Date(node.dateModified).toDateString()}`;
      case 3: // Accessed
        return `${node.title} - Reviewed ${new Date(node.dateAccessed).toDateString()}`;
      case 4: // Created
        return `${node.title} - Created ${new Date(node.dateCreated).toDateString()}`;
      default: // A-Z, Z-A, and Custom don't need anything special appended
        return node.title;
    }
  }
}
