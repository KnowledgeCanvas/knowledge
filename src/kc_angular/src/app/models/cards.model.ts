/*
 * Copyright (c) 2023 Rob Royce
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
  CardOptions,
  CardSizeType,
  CardSortType,
} from '../../../../kc_shared/models/settings.model';
import { KnowledgeSource } from './knowledge.source.model';

export interface PaginateConfig {
  page: number;
  first: number;
  rows: number;
  pageCount: number;
  projectId?: string;
}

export interface KsCardSorter {
  label: string;
  id: CardSortType;
  icon: string;
  sort: (ksList: KnowledgeSource[]) => KnowledgeSource[];
}

export interface KsCardSizer {
  label: string;
  id: CardSizeType;
  gridColClass?: string;
  truncateLength?: number;
}

export interface KsCardListConfig {
  label: string;
  id: string;
  value: boolean;
  onChange: ($event: any) => void;
}

export const defaultSorters: KsCardSorter[] = [
  {
    label: 'Title (Ascending)',
    icon: 'sort-alpha-up',
    id: 'title-a',
    sort: (ksList) =>
      ksList.sort((a, b) => {
        const tA = a.title.toLocaleLowerCase(),
          tB = b.title.toLocaleLowerCase();
        return tA > tB ? 1 : tA < tB ? -1 : 0;
      }),
  },
  {
    label: 'Title (Descending)',
    icon: 'sort-alpha-down',
    id: 'title-d',
    sort: (ksList) =>
      ksList.sort((a, b) => {
        const tA = a.title.toLocaleLowerCase(),
          tB = b.title.toLocaleLowerCase();
        return tA > tB ? -1 : tA < tB ? 1 : 0;
      }),
  },
  {
    label: 'Most Recently Created',
    icon: 'sort-up',
    id: 'created-d',
    sort: (ksList) =>
      ksList.sort((a, b) => {
        const tA = a.dateCreated.valueOf(),
          tB = b.dateCreated.valueOf();
        return tA > tB ? -1 : tA < tB ? 1 : 0;
      }),
  },
  {
    label: 'Least Recently Created',
    icon: 'sort-down',
    id: 'created-a',
    sort: (ksList) =>
      ksList.sort((a, b) => {
        const tA = a.dateCreated.valueOf(),
          tB = b.dateCreated.valueOf();
        return tA > tB ? 1 : tA < tB ? -1 : 0;
      }),
  },
  {
    label: 'Type (Ascending)',
    icon: 'sort-alpha-up',
    id: 'type-a',
    sort: (ksList) =>
      ksList.sort((a, b) => {
        const tA = a.ingestType,
          tB = b.ingestType;
        return tA > tB ? 1 : tA < tB ? -1 : 0;
      }),
  },
  {
    label: 'Type (Descending)',
    icon: 'sort-alpha-down',
    id: 'type-d',
    sort: (ksList) =>
      ksList.sort((a, b) => {
        const tA = a.ingestType,
          tB = b.ingestType;
        return tA > tB ? -1 : tA < tB ? 1 : 0;
      }),
  },
];

export const defaultSizers: KsCardSizer[] = [
  {
    label: 'Auto',
    id: 'auto',
    gridColClass: 'sm:col-12 md:col-6 lg:col-4',
    truncateLength: 64,
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
  },
];

export function configureCards(cardOptions: CardOptions) {
  return [
    {
      label: 'Show Type',
      id: 'ks-card-show-content-type',
      value: cardOptions.showContentType,
      onChange: ($event: any) => {
        const checked = $event.checked;
        if (checked === undefined || checked === null) {
          return;
        }
        cardOptions.showContentType = checked;
      },
    },
    {
      label: 'Show Projects',
      id: 'ks-card-show-project',
      value: cardOptions.showProjectName,
      onChange: ($event: any) => {
        const checked = $event.checked;
        if (checked === undefined || checked === null) {
          return;
        }
        cardOptions.showProjectName = checked;
      },
    },
    {
      label: 'Show Icons',
      id: 'ks-card-show-icons',
      value: cardOptions.showIcon,
      onChange: ($event: any) => {
        const checked = $event.checked;
        if (checked === undefined || checked === null) {
          return;
        }
        cardOptions.showIcon = checked;
      },
    },
    {
      label: 'Show Description',
      id: 'ks-card-show-description',
      value: cardOptions.showDescription,
      onChange: ($event: any) => {
        const checked = $event.checked;
        if (checked === undefined || checked === null) {
          return;
        }
        cardOptions.showDescription = $event.checked;
      },
    },
    {
      label: 'Show Topics',
      value: cardOptions.showTopics,
      id: 'ks-card-show-topics',
      onChange: ($event: any) => {
        const checked = $event.checked;
        if (checked === undefined || checked === null) {
          return;
        }
        cardOptions.showTopics = checked;
      },
    },
    {
      label: 'Show Actions',
      value: true,
      id: 'ks-card-show-actions',
      onChange: ($event: any) => {
        const checked = $event.checked;
        if (checked === undefined || checked === null) {
          return;
        }
        cardOptions.showEdit = checked;
        cardOptions.showOpen = checked;
        cardOptions.showRemove = checked;
        cardOptions.showPreview = checked;
        cardOptions.showSavePdf = checked;
      },
    },
  ];
}
