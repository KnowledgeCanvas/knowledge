/*
 * Copyright (c) 2022 Rob Royce
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {KnowledgeSource} from "../../models/knowledge.source.model";
import {KsCommandService} from "../../services/command-services/ks-command.service";
import {Paginator} from "primeng/paginator";
import {MenuItem, TreeNode} from "primeng/api";
import {KsContextMenuService} from "../../services/factory-services/ks-context-menu.service";
import {
  ApplicationSettingsModel,
  CardOptions,
  CardSizeType,
  CardSortType
} from "../../../../../kc_shared/models/settings.model";
import {SettingsService} from "../../services/ipc-services/settings.service";
import {NotificationsService} from "../../services/user-services/notifications.service";
import {Subject, tap} from "rxjs";
import {KcProject, ProjectUpdateRequest} from "../../models/project.model";
import {ProjectService} from "../../services/factory-services/project.service";
import {ProjectTreeFactoryService} from "../../services/factory-services/project-tree-factory.service";
import {ActivatedRoute} from "@angular/router";
import {takeUntil} from "rxjs/operators";

interface PaginateConfig {
  page: number,
  first: number,
  rows: number,
  pageCount: number,
  projectId?: string
}

interface KsCardSorter {
  label: string,
  id: CardSortType,
  icon: string,
  sort: (ksList: KnowledgeSource[]) => KnowledgeSource[]
}

interface KsCardSizer {
  label: string,
  id: CardSizeType,
  gridColClass?: string,
  truncateLength?: number
}

interface KsCardListConfig {
  label: string,
  id: string,
  value: boolean,
  onChange: ($event: any) => void
}


@Component({
  selector: 'app-ks-card-list',
  template: `
    <div class="w-full h-full flex-col-center-start">
      <p-panel class="ks-grid-panel" styleClass="h-full flex flex-column flex-grow-1">
        <ng-template pTemplate="header">
          <div class="flex-row-center-between w-full">
            <div class="w-16rem">
              <p-dropdown placeholder="Sort by..."
                          [options]="sorters"
                          [autoDisplayFirst]="true"
                          [(ngModel)]="selectedSorter"
                          (onChange)="sortSelected($event)"
                          [filter]="true">
                <ng-template let-sorter pTemplate="selectedItem">
                  <i class="pi pi-{{sorter.icon}}"></i>
                  {{sorter.label}}
                </ng-template>
                <ng-template pTemplate="item" let-sorter>
                  <i class="pi pi-{{sorter.icon}}"></i>
                  {{sorter.label}}
                </ng-template>
              </p-dropdown>
            </div>
            <div *ngIf="!allowMoveAll" class="p-inputgroup p-fluid mr-3 ml-3 w-24rem">
              <span class="p-inputgroup-addon">
                <i class="pi pi-filter"></i>
              </span>
              <input #tableFilter pInputText
                     [(ngModel)]="filterTerm"
                     type="text"
                     placeholder="Filter by title, type, date, etc."
                     (input)="filter()">
              <span class="p-inputgroup-addon"
                    [style.cursor]="tableFilter.value.length ? 'pointer' : 'unset'"
                    (click)="clear()">
                <i class="pi pi-times"></i>
              </span>
            </div>

            <div class="p-fluid flex-row-center-between">
              <app-ks-export *ngIf="allowExport" [data]="ksList"></app-ks-export>
              <button type="button"
                      *ngIf="allowCustomization || allowResize"
                      pButton
                      icon="pi pi-cog"
                      style="margin-left: 10px"
                      (click)="settingsOverlay.toggle($event)">
              </button>
            </div>

            <div *ngIf="allowMoveAll" class="p-fluid mr-3 ml-3 w-24rem flex-row-center-between">
              <div class="p-fluid flex-grow-1">
                <project-selector placeholder="Move to Project" (onSelect)="selectedProject = $event"></project-selector>
              </div>
              <div class="flex-shrink-1 ml-4">
                <button pButton label="Move All" [disabled]="!selectedProject?.key || treeNodes.length < 1" (click)="onMoveAll($event)"></button>
              </div>
            </div>
          </div>
        </ng-template>

        <ng-template pTemplate="content">
          <div class="h-full w-full p-4 overflow-y-auto">
            <div #top style="height: 0; width: 0"></div>
            <div *ngIf="ksList.length > 0 else emptyList" class="grid w-full h-full" style="max-height: calc(100vh - 300px)">
              <div *ngFor="let ks of displayList" [class]="selectedSizer.gridColClass" style="min-width: 24rem">
                <app-ks-card [ks]="ks"
                             (contextmenu)="setActiveKs(ks); cm.show($event)"
                             [showIcon]="ksCardOptions.showIcon"
                             [showContentType]="ksCardOptions.showContentType"
                             [showDescription]="ksCardOptions.showDescription && !minimal"
                             [showEdit]="ksCardOptions.showEdit"
                             [showOpen]="ksCardOptions.showOpen"
                             [showPreview]="ksCardOptions.showPreview"
                             [showProjectBreadcrumbs]="ksCardOptions.showProjectName "
                             [showProjectSelection]="ksCardOptions.showProjectSelection"
                             [showRemove]="ksCardOptions.showRemove"
                             [showFlag]="true"
                             [showThumbnail]="ksCardOptions.showThumbnail && !minimal"
                             [showTopics]="ksCardOptions.showTopics && !minimal"
                             [projectTreeNodes]="treeNodes"
                             [selectedProject]="ksCardOptions.showProjectSelection ? (ks.associatedProject | projectAsTreeNode: treeNodes) : undefined"
                             (onEdit)="_onKsDetail($event)"
                             (onOpen)="_onKsOpen($event)"
                             (onPreview)="_onKsPreview($event)"
                             (onRemove)="_onKsRemove($event)"
                             (onTopicClick)="onTopicSearch.emit($event.topic)"
                             (onProjectChange)="onProjectChange.emit($event)">
                </app-ks-card>
              </div>
            </div>
            <ng-template #emptyList>
              <div  class="h-full w-full">
                <div class="flex-row-center-center text-2xl text-500" style="height: 12rem; width: 100% !important;">
                  {{emptyMessage}}
                </div>
              </div>
            </ng-template>
          </div>
        </ng-template>

        <ng-template pTemplate="footer" pStyleClass="surface-100">
          <p-paginator #paginator
                       [rows]="paginateConfig.rows"
                       [first]="paginateConfig.first"
                       [totalRecords]="filteredList.length"
                       [rowsPerPageOptions]="[10, 20, 30, 40, 50]"
                       [showJumpToPageDropdown]="true"
                       [showPageLinks]="true"
                       [showJumpToPageInput]="true"
                       (onPageChange)="paginate($event)">
          </p-paginator>
        </ng-template>
      </p-panel>
    </div>

    <p-contextMenu #cm
                   styleClass="shadow-7"
                   [model]="ksMenuItems"
                   (onShow)="onKsContextMenu()"
                   appendTo="body">
    </p-contextMenu>

    <p-overlayPanel #settingsOverlay styleClass="surface-100 shadow-7">
      <ng-template pTemplate="content">
        <div style="max-width: 48rem">
          <div *ngIf="allowResize">
            <h3>Card Size</h3>
            <div class="flex-row-center-center pb-3">
              <p-selectButton [options]="sizers"
                              [(ngModel)]="selectedSizer"
                              id="sizeSelect"
                              (onChange)="sizeSelected($event)">
              </p-selectButton>
            </div>
          </div>
          <div *ngIf="allowCustomization">
            <h3>Card Customization</h3>
            <div *ngFor="let opt of ksCardListConfig" class="pb-3">
              <p-checkbox
                [(ngModel)]="opt.value"
                (onChange)="opt.onChange($event); saveConfig(opt)"
                [binary]="true"
                [label]="opt.label">
              </p-checkbox>
            </div>
          </div>
        </div>
      </ng-template>
    </p-overlayPanel>
  `,
  styles: [
    `
      .ks-grid-panel {
        width: 100%;
      }
    `
  ]
})
export class KsCardListComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild('top') dataListTop!: ElementRef;

  @Output() onKsRemove = new EventEmitter<KnowledgeSource>();

  @Output() onProjectChange = new EventEmitter<{ ks: KnowledgeSource, old: string, new: string }>();

  @Input() ksList: KnowledgeSource[] = [];

  @Input() emptyMessage: string = 'Empty'

  @Input() kcProject?: KcProject | null;

  @Input() minimal: boolean = false;

  /**
   * Enable or disable the ability to resize cards.
   * Default: true
   */
  @Input() allowResize: boolean = true;

  /**
   * Enable or disable the ability to export.
   * Default: true
   */
  @Input() allowExport: boolean = true;

  /**
   * Enable or disable the ability to customize card fields.
   * Default: true
   */
  @Input() allowCustomization: boolean = true;

  /**
   * Enable or disable the ability to move all sources at once.
   * Automatically disables filtering
   * Default: false
   */
  @Input() allowMoveAll: boolean = false;

  /**
   * Emitted when a topic tag is clicked
   */
  @Output() onTopicSearch = new EventEmitter<string>();

  @ViewChild('paginator') paginator!: Paginator;

  appSettings!: ApplicationSettingsModel;

  ksMenuItems: MenuItem[] = [];

  ksSelection?: KnowledgeSource;

  filteredList: KnowledgeSource[] = [];

  displayList: KnowledgeSource[] = [];

  filterTerm: string = '';

  paginateConfig: PaginateConfig = {
    first: 0,
    page: 0,
    pageCount: 0,
    rows: 10
  }

  @Input() ksCardOptions: CardOptions = {
    showContentType: true,
    showDescription: false,
    showEdit: true,
    showOpen: true,
    showPreview: true,
    showIcon: true,
    showProjectName: true,
    showProjectSelection: false,
    showRemove: true,
    showTopics: true,
    showThumbnail: true
  }

  ksCardListConfig: KsCardListConfig[] = [];

  sorters: KsCardSorter[] = [
    {
      label: 'Title (Ascending)',
      icon: 'sort-alpha-up',
      id: 'title-a',
      sort: ksList => ksList.sort((a, b) => {
        const tA = a.title.toLocaleLowerCase(), tB = b.title.toLocaleLowerCase();
        return tA > tB ? 1 : (tA < tB ? -1 : 0);
      })
    },
    {
      label: 'Title (Descending)',
      icon: 'sort-alpha-down',
      id: 'title-d',
      sort: ksList => ksList.sort((a, b) => {
        const tA = a.title.toLocaleLowerCase(), tB = b.title.toLocaleLowerCase();
        return tA > tB ? -1 : (tA < tB ? 1 : 0);
      })
    },
    {
      label: 'Most Recently Created',
      icon: 'sort-up',
      id: 'created-d',
      sort: ksList => ksList.sort((a, b) => {
        const tA = a.dateCreated.valueOf(), tB = b.dateCreated.valueOf();
        return tA > tB ? -1 : (tA < tB ? 1 : 0);
      })
    },
    {
      label: 'Least Recently Created',
      icon: 'sort-down',
      id: 'created-a',
      sort: ksList => ksList.sort((a, b) => {
        const tA = a.dateCreated.valueOf(), tB = b.dateCreated.valueOf();
        return tA > tB ? 1 : (tA < tB ? -1 : 0);
      })
    },
    {
      label: 'Type (Ascending)',
      icon: 'sort-alpha-up',
      id: 'type-a',
      sort: ksList => ksList.sort((a, b) => {
        const tA = a.ingestType, tB = b.ingestType;
        return tA > tB ? 1 : (tA < tB ? -1 : 0);
      })
    },
    {
      label: 'Type (Descending)',
      icon: 'sort-alpha-down',
      id: 'type-d',
      sort: ksList => ksList.sort((a, b) => {
        const tA = a.ingestType, tB = b.ingestType;
        return tA > tB ? -1 : (tA < tB ? 1 : 0);
      })
    }
  ];
  sizers: KsCardSizer[] = [
    {
      label: 'Auto',
      id: 'auto',
      gridColClass: 'sm:col-12 md:col-6 lg:col-4',
      truncateLength: 64
    },
    {
      label: 'X-Small',
      id: 'xs',
      gridColClass: 'col-3',
    },
    {
      label: 'Small',
      id: 'sm',
      gridColClass: 'col-4',
    },
    {
      label: 'Medium',
      id: 'md',
      gridColClass: 'col-6',
    },
    {
      label: 'Large',
      id: 'lg',
      gridColClass: 'col-12',
    }
  ];

  selectedSorter: KsCardSorter = this.sorters[0];

  selectedSizer: KsCardSizer = this.sizers[0];

  treeNodes: TreeNode[] = [];

  selectedProject?: TreeNode = undefined;

  private cleanUp = new Subject();

  constructor(private command: KsCommandService,
              private menu: KsContextMenuService,
              private settings: SettingsService,
              private projects: ProjectService,
              private tree: ProjectTreeFactoryService,
              private route: ActivatedRoute,
              private notifications: NotificationsService) {
    projects.projectTree.pipe(
      takeUntil(this.cleanUp),
      tap((tree) => {
        this.selectedProject = this.tree.findTreeNode(this.projects.getCurrentProjectId()?.value ?? '', tree) ?? {};
      })
    ).subscribe()

    tree.treeNodes.pipe(
      takeUntil(this.cleanUp),
      tap((nodes) => {
        this.treeNodes = nodes;
      })
    ).subscribe()

    settings.app.pipe(
      takeUntil(this.cleanUp),
      tap((appSettings) => {
        if (appSettings && appSettings.grid) {
          this.appSettings = appSettings;
          this.loadSizer();
          this.loadSorter();
        }
      })
    ).subscribe();
  }

  configureCardList() {
    this.ksCardListConfig = [
      {
        label: 'Show Type',
        id: 'ks-card-show-content-type',
        value: this.ksCardOptions.showContentType,
        onChange: ($event) => {
          const checked = $event.checked;
          if (checked === undefined || checked === null) {
            return;
          }
          this.ksCardOptions.showContentType = checked;
        }
      },
      {
        label: 'Show Projects',
        id: 'ks-card-show-project',
        value: this.ksCardOptions.showProjectName,
        onChange: ($event) => {
          const checked = $event.checked;
          if (checked === undefined || checked === null) {
            return;
          }
          this.ksCardOptions.showProjectName = checked;
        }
      },
      {
        label: 'Show Icons',
        id: 'ks-card-show-icons',
        value: this.ksCardOptions.showIcon,
        onChange: ($event) => {
          const checked = $event.checked;
          if (checked === undefined || checked === null) {
            return;
          }
          this.ksCardOptions.showIcon = checked;
        }
      },
      {
        label: 'Show Description',
        id: 'ks-card-show-description',
        value: this.ksCardOptions.showDescription,
        onChange: ($event) => {
          const checked = $event.checked;
          if (checked === undefined || checked === null) {
            return;
          }
          this.ksCardOptions.showDescription = $event.checked
        }
      },
      {
        label: 'Show Topics',
        value: this.ksCardOptions.showTopics,
        id: 'ks-card-show-topics',
        onChange: ($event) => {
          const checked = $event.checked;
          if (checked === undefined || checked === null) {
            return;
          }
          this.ksCardOptions.showTopics = checked
        }
      },
      {
        label: 'Show Actions',
        value: true,
        id: 'ks-card-show-actions',
        onChange: ($event) => {
          const checked = $event.checked;
          if (checked === undefined || checked === null) {
            return;
          }
          this.ksCardOptions.showEdit = checked;
          this.ksCardOptions.showOpen = checked;
          this.ksCardOptions.showRemove = checked;
          this.ksCardOptions.showPreview = checked;
        }
      },
    ];
  }

  ngOnInit(): void {
    this.getPaginator();
    this.loadAllConfig();
    this.assignCopy();
    this.setSizers();
    this.configureCardList();
  }

  ngOnDestroy() {
    this.cleanUp.next({});
    this.cleanUp.complete();
  }

  ngOnChanges(changes: SimpleChanges) {

    if (changes.ksCardOptions?.currentValue) {
      setTimeout(() => {
        this.configureCardList();
      })
    }

    try {
      if (changes.kcProject?.currentValue) {
        this.filterTerm = '';
        this.ksList = changes.kcProject.currentValue.knowledgeSource ?? [];
        this.assignCopy();
      } else if (changes.ksList && !changes.ksList.firstChange) {
        this.filterTerm = '';
        this.assignCopy();
      }
    } catch (e) {
      if (changes.ksList && !changes.ksList.firstChange) {
        this.filterTerm = '';
        this.assignCopy();
      }
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(_: any) {
    this.setSizers();
  }

  @HostListener('document:keydown.Control.]')
  @HostListener('document:keydown.meta.]')
  keyPressNext() {
    const next = this.paginateConfig.first + this.paginateConfig.rows;
    if (next < this.ksList.length) {
      this.paginateConfig.first = this.paginateConfig.first + this.paginateConfig.rows;
    }
    this.assignCopy();
    this.dataListTop.nativeElement.scrollIntoView();
  }

  @HostListener('document:keydown.Control.[')
  @HostListener('document:keydown.meta.[')
  keyPressPrevious() {
    this.paginateConfig.first = Math.max(0, this.paginateConfig.first - this.paginateConfig.rows);
    this.assignCopy();
    this.dataListTop.nativeElement.scrollIntoView();
  }

  setSizers() {
    let colXs: string, colSm: string, colMd: string, colLg: string, colAuto: string;
    let winWidth;

    const gridContainer = document.getElementById('grid-container');
    if (gridContainer) {
      winWidth = gridContainer.clientWidth ?? gridContainer.scrollWidth ?? gridContainer.offsetWidth;
    } else {
      winWidth = window.innerWidth;
    }

    if (0 < winWidth && winWidth < 825) {
      colXs = 'col-6';
      colSm = 'col-6';
      colMd = 'col-12';
      colLg = 'col-12';
      colAuto = 'col-12';
    } else if (825 <= winWidth && winWidth < 1000) {
      colXs = 'col-4';
      colSm = 'col-6';
      colMd = 'col-6';
      colLg = 'col-12';
      colAuto = 'col-6';
    } else if (1000 <= winWidth && winWidth < 1200) {
      colXs = 'col-4';
      colSm = 'col-6';
      colMd = 'col-6';
      colLg = 'col-12';
      colAuto = 'col-6';
    } else if (1200 <= winWidth && winWidth < 1550) {
      colXs = 'col-3';
      colSm = 'col-4';
      colMd = 'col-6';
      colLg = 'col-6';
      colAuto = 'col-4';
    } else if (1550 <= winWidth && winWidth < 2200) {
      colXs = 'col-2';
      colSm = 'col-3';
      colMd = 'col-3';
      colLg = 'col-4';
      colAuto = 'col-3';
    } else if (2200 <= winWidth) {
      colXs = 'col-1';
      colSm = 'col-2';
      colMd = 'col-3';
      colLg = 'col-3';
      colAuto = 'col-2';
    }

    this.sizers.forEach((sizer) => {
      if (this.minimal) {
        sizer.gridColClass = colAuto;
        return;
      }

      switch (sizer.id) {
        case 'auto':
          sizer.gridColClass = colAuto;
          break;
        case 'xs':
          sizer.gridColClass = colXs;
          break;
        case 'sm':
          sizer.gridColClass = colSm;
          break;
        case 'md':
          sizer.gridColClass = colMd;
          break;
        case 'lg':
          sizer.gridColClass = colLg;
          break;
      }
    });
  }

  assignCopy() {
    this.ksList = this.selectedSorter.sort(this.ksList);

    if (this.filterTerm === '') {
      this.filteredList = Object.assign([], this.ksList);
    } else {
      this.filteredList = Object.assign([], this.ksList)
        .filter(ks => JSON.stringify(ks)
          .toLocaleLowerCase()
          .includes(this.filterTerm.toLocaleLowerCase()));
    }
    this.displayList = Object.assign([], this.filteredList)
      .slice(this.paginateConfig.first, this.paginateConfig.first + this.paginateConfig.rows);
  }

  _onKsPreview($event: KnowledgeSource) {
    this.command.preview($event);
  }

  _onKsOpen($event: KnowledgeSource) {
    this.command.open($event)
  }

  _onKsDetail($event: KnowledgeSource) {
    this.command.detail($event);
  }

  _onKsRemove($event: KnowledgeSource) {
    this.onKsRemove.emit($event);
  }

  filter() {
    this.assignCopy();
    if (this.paginator.getPage() !== 0) {
      this.paginator.changePage(0);
    }
  }

  clear() {
    this.filterTerm = '';
    this.assignCopy();
  }

  paginate($event: PaginateConfig) {
    this.paginateConfig = $event;
    this.savePaginator($event);
    this.dataListTop.nativeElement.scrollIntoView();
    this.assignCopy();
  }

  getPaginator() {
    const paginateStr = localStorage.getItem('grid-paginator');
    if (paginateStr) {
      const config = JSON.parse(paginateStr);

      if (config) {
        this.paginateConfig.rows = config.rows;

        if ((config.projectId && config.projectId !== this.route.snapshot.params.projectId) || this.ksList.length < this.paginateConfig.rows) {
          this.paginateConfig.page = 0;
          this.paginateConfig.first = 0;
        } else {
          const page = Math.floor(this.ksList.length / this.paginateConfig.rows);
          this.paginateConfig.page = Math.min(page, config.page);
        }

        this.paginateConfig.first = this.paginateConfig.page * this.paginateConfig.rows;
        this.savePaginator(this.paginateConfig);
      }
    }
  }

  savePaginator(config: PaginateConfig) {

    config.projectId = this.route.snapshot.params.projectId ?? '';
    localStorage.setItem('grid-paginator', JSON.stringify(config));
  }

  loadSizer() {
    const sizer = this.sizers.find(s => s.id === this.appSettings.grid.size);
    if (sizer) {
      this.selectedSizer = sizer;
    } else {
      this.notifications.warn('GridView', 'Invalid Sizer', this.appSettings.grid.size);
    }
  }

  saveSizer(sizerId: CardSizeType) {
    this.appSettings.grid.size = sizerId;
    this.settings.set({app: this.appSettings});
  }

  sizeSelected($event: any) {
    if (!$event.value) {
      this.notifications.warn('GridView', 'Invalid Sizer', $event);
    } else {
      this.size($event.value);
      this.saveSizer($event.value.id);
    }
  }

  size(sizer: KsCardSizer) {
    this.selectedSizer = sizer;
  }

  sort(sorter: KsCardSorter) {
    this.selectedSorter = sorter;
    this.assignCopy();
    if (this.paginator.getPage() !== 0) {
      this.paginator.changePage(0);
    }
  }

  loadSorter() {
    const sorter = this.sorters.find(s => s.id === this.appSettings.grid.sorter);
    if (sorter) {
      this.selectedSorter = sorter;
    } else {
      this.notifications.warn('GridView', 'Invalid Sorter', this.appSettings.grid.sorter);
    }
  }

  loadAllConfig() {
    for (let opt of this.ksCardListConfig) {
      this.loadConfig(opt);
    }
  }

  loadConfig(cardListConfig: KsCardListConfig) {
    const str = localStorage.getItem(cardListConfig.id);
    if (!str) {
      this.notifications.warn('Card List', 'Option Unavailable', cardListConfig.label);
      return;
    }

    const val = JSON.parse(str)
    if (val === undefined || typeof val !== 'boolean') {
      this.notifications.warn('Card List', 'Option Invalid', cardListConfig.label);
      return;
    }

    cardListConfig.value = val;
    cardListConfig.onChange({checked: val});
  }

  saveConfig(cardListConfig: KsCardListConfig) {
    const cfg = this.ksCardListConfig.find(o => o.id === cardListConfig.id);

    if (cfg) {
      localStorage.setItem(cfg.id, JSON.stringify(cfg.value));
    }
  }

  saveSorter(sorterId: CardSortType) {
    this.appSettings.grid.sorter = sorterId;
    this.settings.set({app: this.appSettings});
  }

  sortSelected($event: any) {
    if ($event.value) {
      this.sort($event.value);
      this.saveSorter($event.value.id);
    }
  }

  onKsContextMenu() {
    if (this.ksSelection) {
      this.ksMenuItems = this.menu.generate(this.ksSelection);
    }
  }

  setActiveKs(ks: KnowledgeSource) {
    this.ksSelection = ks;
  }

  onMoveAll(_: MouseEvent) {
    if (!this.selectedProject || !this.selectedProject.key || this.selectedProject.key.trim() === '') {
      this.notifications.error('Source Card List', 'Failed to Move', 'No project selected.');
      return;
    }

    let updates: ProjectUpdateRequest[] = [];

    for (let ks of this.ksList) {
      if (this.selectedProject.key !== ks.associatedProject.value) {
        updates.push({
          id: ks.associatedProject,
          moveKnowledgeSource: {ks: ks, new: {value: this.selectedProject.key ?? ''}}
        });
      }
    }

    if (updates.length > 0) {
      this.projects.updateProjects(updates).then(() => {
        this.notifications.success('Source Card List', `Source${this.ksList.length > 1 ? 's' : ''} Moved`, this.ksList.map(k => k.title).join(', '));
      });
    }
  }
}
