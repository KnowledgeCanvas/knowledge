/*
 * Copyright (c) 2022-2023 Rob Royce
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
  ViewChild,
} from '@angular/core';
import { KnowledgeSource } from '@app/models/knowledge.source.model';
import { KsCommandService } from '@services/command-services/ks-command.service';
import { Paginator } from 'primeng/paginator';
import { MenuItem, TreeNode } from 'primeng/api';
import { KsContextMenuService } from '@services/factory-services/ks-context-menu.service';
import {
  ApplicationSettingsModel,
  CardOptions,
  CardSizeType,
  CardSortType,
} from '@shared/models/settings.model';
import { SettingsService } from '@services/ipc-services/settings.service';
import { NotificationsService } from '@services/user-services/notifications.service';
import { BehaviorSubject, Subject, tap, throttleTime } from 'rxjs';
import { KcProject, ProjectUpdateRequest } from '@app/models/project.model';
import { ProjectService } from '@services/factory-services/project.service';
import { ProjectTreeFactoryService } from '@services/factory-services/project-tree-factory.service';
import { ActivatedRoute } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import {
  configureCards,
  defaultSizers,
  defaultSorters,
  KsCardListConfig,
  KsCardSizer,
  KsCardSorter,
  PaginateConfig,
} from '@app/models/cards.model';

@Component({
  selector: 'app-ks-card-list',
  templateUrl: './ks-card-list.component.html',
  styleUrls: [],
})
export class KsCardListComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild('top') dataListTop!: ElementRef;

  @Output() onKsRemove = new EventEmitter<KnowledgeSource>();

  @Output() onProjectChange = new EventEmitter<{
    ks: KnowledgeSource;
    old: string;
    new: string;
  }>();

  @Input() ksList: KnowledgeSource[] = [];

  @Input() emptyMessage = 'Empty';

  @Input() kcProject?: KcProject | null;

  @Input() minimal = false;

  /* Enable or disable the ability to resize cards. */
  @Input() allowResize = true;

  /* Enable or disable the ability to export. */
  @Input() allowExport = true;

  /* Enable or disable the ability to customize card fields. */
  @Input() allowCustomization = true;

  /* Enable or disable the ability to move all sources at once. Automatically disables filtering */
  @Input() allowMoveAll = false;

  /* Emitted when a topic tag is clicked */
  @Output() onTopicSearch = new EventEmitter<string>();

  @ViewChild('paginator') paginator!: Paginator;

  appSettings!: ApplicationSettingsModel;

  ksMenuItems: MenuItem[] = [];

  ksSelection?: KnowledgeSource;

  filteredList: KnowledgeSource[] = [];

  displayList: KnowledgeSource[] = [];

  filterTerm = '';

  paginateConfig: PaginateConfig = {
    first: 0,
    page: 0,
    pageCount: 0,
    rows: 10,
  };

  @Input() ksCardOptions: CardOptions = {
    showContentType: true,
    showDescription: false,
    showEdit: true,
    showOpen: true,
    showSavePdf: true,
    showPreview: true,
    showIcon: true,
    showProjectName: true,
    showProjectSelection: false,
    showRemove: true,
    showTopics: true,
    showThumbnail: true,
  };

  ksCardListConfig: KsCardListConfig[] = [];
  sorters: KsCardSorter[] = defaultSorters;
  sizers: KsCardSizer[] = defaultSizers;
  selectedSorter: KsCardSorter = this.sorters[0];
  selectedSizer: KsCardSizer = this.sizers[0];
  treeNodes: TreeNode[] = [];
  selectedProject?: TreeNode = undefined;
  private cleanUp = new Subject();
  private _windowResize = new BehaviorSubject({});

  constructor(
    private command: KsCommandService,
    private menu: KsContextMenuService,
    private settings: SettingsService,
    private projects: ProjectService,
    private tree: ProjectTreeFactoryService,
    private route: ActivatedRoute,
    private notifications: NotificationsService
  ) {
    projects.projectTree
      .pipe(
        takeUntil(this.cleanUp),
        tap((tree) => {
          this.selectedProject =
            this.tree.findTreeNode(
              this.projects.getCurrentProjectId()?.value ?? '',
              tree
            ) ?? {};
        })
      )
      .subscribe();

    tree.treeNodes
      .pipe(
        takeUntil(this.cleanUp),
        tap((nodes) => {
          this.treeNodes = nodes;
        })
      )
      .subscribe();

    settings.app
      .pipe(
        takeUntil(this.cleanUp),
        tap((appSettings) => {
          if (appSettings && appSettings.grid) {
            this.appSettings = appSettings;
            this.loadSizer();
            this.loadSorter();
          }
        })
      )
      .subscribe();

    this._windowResize
      .asObservable()
      .pipe(
        takeUntil(this.cleanUp),
        throttleTime(50),
        tap(() => {
          this.setSizers();
        })
      )
      .subscribe();
  }

  configureCardList() {
    this.ksCardListConfig = configureCards(this.ksCardOptions);
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
      });
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

  setSizers() {
    let colXs: string,
      colSm: string,
      colMd: string,
      colLg: string,
      colAuto: string;
    let winWidth;

    const gridContainer = document.getElementById('grid-container');
    if (gridContainer) {
      winWidth =
        gridContainer.clientWidth ??
        gridContainer.scrollWidth ??
        gridContainer.offsetWidth;
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
      this.filteredList = Object.assign([], this.ksList).filter((ks) =>
        JSON.stringify(ks)
          .toLocaleLowerCase()
          .includes(this.filterTerm.toLocaleLowerCase())
      );
    }
    this.displayList = Object.assign([], this.filteredList).slice(
      this.paginateConfig.first,
      this.paginateConfig.first + this.paginateConfig.rows
    );
  }

  _onKsPreview($event: KnowledgeSource) {
    this.command.preview($event);
  }

  _onKsOpen($event: KnowledgeSource) {
    this.command.open($event);
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

        if (
          (config.projectId &&
            config.projectId !== this.route.snapshot.params.projectId) ||
          this.ksList.length < this.paginateConfig.rows
        ) {
          this.paginateConfig.page = 0;
          this.paginateConfig.first = 0;
        } else {
          const page = Math.floor(
            this.ksList.length / this.paginateConfig.rows
          );
          this.paginateConfig.page = Math.min(page, config.page);
        }

        this.paginateConfig.first =
          this.paginateConfig.page * this.paginateConfig.rows;
        this.savePaginator(this.paginateConfig);
      }
    }
  }

  savePaginator(config: PaginateConfig) {
    config.projectId = this.route.snapshot.params.projectId ?? '';
    localStorage.setItem('grid-paginator', JSON.stringify(config));
  }

  loadSizer() {
    const sizer = this.sizers.find((s) => s.id === this.appSettings.grid.size);
    if (sizer) {
      this.selectedSizer = sizer;
    } else {
      this.notifications.warn(
        'GridView',
        'Invalid Sizer',
        this.appSettings.grid.size
      );
    }
  }

  saveSizer(sizerId: CardSizeType) {
    this.appSettings.grid.size = sizerId;
    this.settings.set({ app: this.appSettings });
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
    const sorter = this.sorters.find(
      (s) => s.id === this.appSettings.grid.sorter
    );
    if (sorter) {
      this.selectedSorter = sorter;
    } else {
      this.notifications.warn(
        'GridView',
        'Invalid Sorter',
        this.appSettings.grid.sorter
      );
    }
  }

  loadAllConfig() {
    for (const opt of this.ksCardListConfig) {
      this.loadConfig(opt);
    }
  }

  loadConfig(cardListConfig: KsCardListConfig) {
    const str = localStorage.getItem(cardListConfig.id);
    if (!str) {
      this.notifications.warn(
        'Card List',
        'Option Unavailable',
        cardListConfig.label
      );
      return;
    }

    const val = JSON.parse(str);
    if (val === undefined || typeof val !== 'boolean') {
      this.notifications.warn(
        'Card List',
        'Option Invalid',
        cardListConfig.label
      );
      return;
    }

    cardListConfig.value = val;
    cardListConfig.onChange({ checked: val });
  }

  saveConfig(cardListConfig: KsCardListConfig) {
    const cfg = this.ksCardListConfig.find((o) => o.id === cardListConfig.id);

    if (cfg) {
      localStorage.setItem(cfg.id, JSON.stringify(cfg.value));
    }
  }

  saveSorter(sorterId: CardSortType) {
    this.appSettings.grid.sorter = sorterId;
    this.settings.set({ app: this.appSettings });
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

  onMoveAll() {
    if (
      !this.selectedProject ||
      !this.selectedProject.key ||
      this.selectedProject.key.trim() === ''
    ) {
      this.notifications.error(
        'Source Card List',
        'Failed to Move',
        'No project selected.'
      );
      return;
    }

    const updates: ProjectUpdateRequest[] = [];

    for (const ks of this.ksList) {
      if (this.selectedProject.key !== ks.associatedProject.value) {
        updates.push({
          id: ks.associatedProject,
          moveKnowledgeSource: {
            ks: ks,
            new: { value: this.selectedProject.key ?? '' },
          },
        });
      }
    }

    if (updates.length > 0) {
      this.projects.updateProjects(updates).then(() => {
        this.notifications.success(
          'Source Card List',
          `Source${this.ksList.length > 1 ? 's' : ''} Moved`,
          this.ksList.map((k) => k.title).join(', ')
        );
      });
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this._windowResize.next({});
  }

  @HostListener('document:keydown.Control.]')
  @HostListener('document:keydown.meta.]')
  keyPressNext() {
    const next = this.paginateConfig.first + this.paginateConfig.rows;
    if (next < this.ksList.length) {
      this.paginateConfig.first =
        this.paginateConfig.first + this.paginateConfig.rows;
    }
    this.assignCopy();
    this.dataListTop.nativeElement.scrollIntoView();
  }

  @HostListener('document:keydown.Control.[')
  @HostListener('document:keydown.meta.[')
  keyPressPrevious() {
    this.paginateConfig.first = Math.max(
      0,
      this.paginateConfig.first - this.paginateConfig.rows
    );
    this.assignCopy();
    this.dataListTop.nativeElement.scrollIntoView();
  }
}
