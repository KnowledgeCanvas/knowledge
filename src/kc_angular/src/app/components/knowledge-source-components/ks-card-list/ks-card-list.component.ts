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
import {KnowledgeSource} from "../../../models/knowledge.source.model";
import {KsCommandService} from "../../../services/command-services/ks-command/ks-command.service";
import {Paginator} from "primeng/paginator";
import {KsCardOptions} from "../ks-card/ks-card.component";
import {MenuItem} from "primeng/api";
import {KsContextMenuService} from "../../../services/factory-services/ks-context-menu/ks-context-menu.service";

interface PaginateConfig {
  page: number,
  first: number,
  rows: number,
  pageCount: number
}

interface KsCardSorter {
  label: string,
  id: string,
  icon: string,
  sort: (ksList: KnowledgeSource[]) => KnowledgeSource[]
}

interface KsCardSizer {
  label: string,
  id: 'auto' | 'xs' | 'sm' | 'md' | 'lg',
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
  templateUrl: './ks-card-list.component.html',
  styleUrls: ['./ks-card-list.component.scss']
})
export class KsCardListComponent implements OnInit, OnChanges {
  /**
   * List of Knowledge Sources to be displayed
   */
  @Input() ksList: KnowledgeSource[] = [];

  /**
   * Enable or disable the ability to resize cards.
   * Default: true
   */
  @Input() allowResize: boolean = true;

  /**
   * Enable or disable the ability to customize card fields.
   * Default: true
   */
  @Input() allowCustomization: boolean = true;

  /**
   * Emitted when a topic tag is clicked
   */
  @Output() onTopicSearch = new EventEmitter<string>();

  @ViewChild('tableFilter') tableFilter!: ElementRef;

  @ViewChild('paginator') paginator!: Paginator;

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

  ksCardOptions: KsCardOptions = {
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

  ksCardListConfig: KsCardListConfig[] = [
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

  private SORT_STORAGE_KEY = 'grid-sort-key';

  private SIZE_STORAGE_KEY = 'grid-size-key';

  constructor(private ksCommandService: KsCommandService, private ksContextMenuService: KsContextMenuService) {
  }


  ngOnInit(): void {
    this.loadSizer();
    this.loadSorter();
    this.loadAllConfig();
    this.assignCopy();
    this.setSizers();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.ksList && !changes.ksList.firstChange) {
      this.filterTerm = '';
      this.assignCopy();
    }
  }

  @HostListener('document:keydown.meta.f')
  focusFilter() {
    this.tableFilter.nativeElement.focus();
  }

  @HostListener('window:resize', ['$event'])
  onResize(_: any) {
    this.setSizers();
  }

  setSizers() {
    const winWidth = window.innerWidth;

    let colXs: string, colSm: string, colMd: string, colLg: string, colAuto: string;

    if (0 < winWidth && winWidth < 900) {
      // Up to 1 card per row
      colXs = 'col-6';
      colSm = 'col-6';
      colMd = 'col-12';
      colLg = 'col-12';
      colAuto = 'col-12';
    } else if (900 <= winWidth && winWidth < 1200) {
      // Up to 2 cards per row
      colXs = 'col-4';
      colSm = 'col-6';
      colMd = 'col-6';
      colLg = 'col-12';
      colAuto = 'col-6';
    } else if (1200 <= winWidth && winWidth < 1550) {
      // Up to 3 cards per row
      colXs = 'col-3';
      colSm = 'col-4';
      colMd = 'col-6';
      colLg = 'col-6';
      colAuto = 'col-4';
    } else if (1550 <= winWidth && winWidth < 2200) {
      // Up to 4 cards per row
      colXs = 'col-2';
      colSm = 'col-3';
      colMd = 'col-4';
      colLg = 'col-6';
      colAuto = 'col-3';
    } else if (2200 <= winWidth) {
      // Up to 6 cards per row
      colXs = 'col-1';
      colSm = 'col-2';
      colMd = 'col-3';
      colLg = 'col-4';
      colAuto = 'col-2';
    }

    this.sizers.forEach((sizer) => {
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

  onKsPreview($event: KnowledgeSource) {
    this.ksCommandService.preview($event);
  }

  onKsOpen($event: KnowledgeSource) {
    this.ksCommandService.open($event);
  }

  onKsDetail($event: KnowledgeSource) {
    this.ksCommandService.detail($event);
  }

  onKsRemove($event: KnowledgeSource) {
    this.ksCommandService.remove([$event]);
  }

  onKsModified($event: KnowledgeSource) {
    this.ksCommandService.update([$event]);
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
    this.assignCopy();
  }

  loadSizer() {
    const sizeKey = localStorage.getItem(this.SIZE_STORAGE_KEY);
    if (!sizeKey) {
      return;
    }
    const sizer = this.sizers.find(s => s.id === sizeKey);
    if (sizer) {
      this.selectedSizer = sizer;
    }
  }

  saveSizer(sizerId: string) {
    localStorage.setItem(this.SIZE_STORAGE_KEY, sizerId);
  }

  sizeSelected($event: any) {
    if ($event.value) {
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
    const sortKey = localStorage.getItem(this.SORT_STORAGE_KEY);
    if (!sortKey) {
      return;
    }
    const sorter = this.sorters.find(s => s.id === sortKey);
    if (sorter) {
      this.selectedSorter = sorter;
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
      console.warn('KsCardList: Option unavailable... ', cardListConfig.label);
      return;
    }

    const val = JSON.parse(str)
    if (val === undefined || typeof val !== 'boolean') {
      console.warn('KsCardList: Option invalid... ', cardListConfig.label, val);
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

  saveSorter(sorterId: string) {
    localStorage.setItem(this.SORT_STORAGE_KEY, sorterId);
  }

  sortSelected($event: any) {
    if ($event.value) {
      this.sort($event.value);
      this.saveSorter($event.value.id);
    }
  }

  onKsContextMenu() {
    if (this.ksSelection) {
      this.ksMenuItems = this.ksContextMenuService.generate(this.ksSelection);
    }
  }

  setActiveKs(ks: KnowledgeSource) {
    this.ksSelection = ks;
  }
}
