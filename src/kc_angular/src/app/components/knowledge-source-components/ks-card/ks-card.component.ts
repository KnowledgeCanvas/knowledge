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


import {Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {KnowledgeSource} from "../../../models/knowledge.source.model";
import {ElectronIpcService} from "../../../services/ipc-services/electron-ipc/electron-ipc.service";
import {TreeNode} from "primeng/api";
import {Subscription} from "rxjs";
import {UuidModel} from "../../../models/uuid.model";

export interface KsCardOptions {
  showThumbnail: boolean,
  showDescription: boolean,
  showProjectSelection: boolean,
  showTopics: boolean,
  showIcon: boolean,
  showRemove: boolean,
  showPreview: boolean,
  showEdit: boolean,
  showOpen: boolean,
  showContentType: boolean,
  showProjectName: boolean
}

@Component({
  selector: 'app-ks-card',
  templateUrl: './ks-card.component.html',
  styleUrls: ['./ks-card.component.scss']
})
export class KsCardComponent implements OnInit, OnDestroy {
  /**
   * The Knowledge Source to be displayed on this card
   */
  @Input() ks!: KnowledgeSource;

  /**
   * The project tree to display in the Project selector (if enabled)
   */
  @Input() projectTreeNodes: TreeNode[] = [];

  /**
   * The currently selected project, which determines the default
   * project shown in Project selector (if enabled)
   */
  @Input() selectedProject?: TreeNode;

  /**
   * The ID of the current project
   */
  @Input() currentProject?: UuidModel | null;

  /**
   * Determines whether to display KS thumbnail in header (default: true)
   */
  @Input() showThumbnail: boolean = true;

  /**
   * Determines whether to display KS description (default: true)
   */
  @Input() showDescription: boolean = true;

  /**
   * Determines whether to display Project selector (default: true)
   */
  @Input() showProjectSelection: boolean = true;

  /**
   * Determines whether to display list of KS Tags as a Tooltip (default: true)
   */
  @Input() showTopics: boolean = true;

  /**
   * Determines whether to display the "Remove" button (default: true)
   */
  @Input() showRemove: boolean = true;

  /**
   * Determines whether to display the "Preview" button (default: true)
   */
  @Input() showPreview: boolean = true;

  /**
   * Determines whether to display the "Edit" button (default: true)
   */
  @Input() showEdit: boolean = true;

  /**
   * Determines whether to display the "Open" button (default: true)
   */
  @Input() showOpen: boolean = true;

  /**
   * Determines whether to show Content Type property (default: true)
   */
  @Input() showContentType: boolean = true;

  /**
   * Determines whether to show KS icon (default: true)
   */
  @Input() showIcon: boolean = true;

  /**
   * Determines whether to show name of the Associated Project (default: true)
   */
  @Input() showProjectBreadcrumbs: boolean = true;

  /**
   * EventEmitter that is triggered when the "Remove" button is pressed
   */
  @Output() onRemove = new EventEmitter<KnowledgeSource>();

  /**
   * EventEmitter that is triggered when the "Preview" button is pressed
   */
  @Output() onPreview = new EventEmitter<KnowledgeSource>();

  /**
   * EventEmitter that is triggered when the "Open" button is pressed
   */
  @Output() onOpen = new EventEmitter<KnowledgeSource>();

  /**
   * EventEmitter that is triggered when the "Edit" button is pressed
   */
  @Output() onEdit = new EventEmitter<KnowledgeSource>();

  /**
   * EventEmitter that is triggered when the KS has been reassigned to a new Project
   */
  @Output() onProjectChange = new EventEmitter<{ ks: KnowledgeSource, old: string, new: string }>();

  /**
   * EventEmitter that is triggered when a topic is clicked
   */
  @Output() onTopicClick = new EventEmitter<{ ks: KnowledgeSource, topic: string }>();

  /**
   * EventEmitter that is triggered when a topic is added or removed
   */
  @Output() onTopicChange = new EventEmitter<KnowledgeSource>();

  hovering: boolean = false;

  thumbnail?: string;

  thumbnailUnavailable: boolean = false;

  contentType?: string;

  keywords?: string[];

  description?: string;

  actionButtonTooltipOptions = {
    showDelay: 750,
    tooltipPosition: 'top'
  };
  private _subProjectTree?: Subscription;

  private _subThumbnail?: Subscription;

  constructor(private ipcService: ElectronIpcService) {

  }

  ngOnInit(): void {
    if (this.ks.ingestType === 'file') {
      this._subThumbnail = this.ipcService.thumbnail.subscribe((thumbnail) => {
        if (thumbnail !== undefined && thumbnail.id && thumbnail.id === this.ks.id.value) {
          this.thumbnail = thumbnail.thumbnail;
        }
      });
    }

    this.getThumbnail();

    this.getContentType().then((result) => {
      this.contentType = result;
    });

    this.getKeywords().then((result) => {
      this.keywords = result;
    });

    this.getDescription().then((result) => {
      this.description = result;
    });

    setTimeout(() => {
      if (this.thumbnail === undefined) {
        this.thumbnailUnavailable = true;
      }
    }, 1000);
  }

  ngOnDestroy() {
    if (this._subProjectTree) {
      this._subProjectTree.unsubscribe();
    }

    if (this._subThumbnail) {
      this._subThumbnail.unsubscribe();
    }
  }

  getThumbnail() {
    let link: string = typeof this.ks.accessLink === 'string' ? this.ks.accessLink : this.ks.accessLink.href;
    if (this.ks.ingestType === 'file') {
      this.ipcService.getFileThumbnail([{
        path: link,
        id: this.ks.id.value
      }]);
      return;
    } else {
      let meta = this.ks.reference.source.website?.metadata?.meta;
      if (meta) {
        let ogImage = meta.find(m => m.key === 'og:image');
        if (ogImage && ogImage.value) {
          const url = ogImage.value;
          fetch(url).then((result) => {
            result.text().then((text) => {
              // Sometimes, requesting an image will return HTML, which is signs of failure
              if (!text.startsWith('<')) {
                this.thumbnail = url;
              }
            })
          }).catch((reason) => {
            console.error('Unable to get thumbnail for ', url);
          })
        }
      }
    }
  }

  @HostListener('mouseover')
  onCardHover() {
    if (!this.hovering)
      this.hovering = true;
  }

  @HostListener('mouseleave')
  onCardHoverExit() {
    if (this.hovering)
      this.hovering = false;
  }

  async getContentType() {
    if (this.ks.ingestType === 'file') {
      return `File (${this.ks.reference.source.file?.type || 'unknown'})`;
    } else {
      let meta = this.ks.reference.source.website?.metadata?.meta;
      if (meta) {
        let ogType = meta.find(m => m.key === 'og:type');
        if (ogType && ogType.value) {
          return ogType.value;
        }
      }
      return 'Website';
    }
  }

  async getKeywords() {
    if (this.ks.ingestType === 'file') {
      return this.ks.topics;
    }

    let tags: string[] = [];

    if (this.ks.topics) {
      for (let topic of this.ks.topics) {
        tags.push(topic);
      }
    }

    let meta = this.ks.reference.source.website?.metadata?.meta;
    if (meta) {
      let keywords = meta.find(m => m.key === 'keywords');
      if (keywords && keywords.value) {
        let kwds = keywords.value
          .trim()
          .split(',')
          .filter(k => k.trim() !== '');
        if (kwds && kwds.length) {
          for (let kwd of kwds) {
            tags.push(kwd);
          }
        }
      }
    }

    return tags;
  }

  async getDescription() {
    if (this.ks.ingestType === 'file') {
      return undefined;
    }

    let meta = this.ks.reference.source.website?.metadata?.meta;
    if (meta) {
      let description = meta.find(m => m.key?.includes('description'));
      if (description && description.value) {
        return description.value;
      }
    }

    return this.ks.description;
  }

  onProjectSelected($event: any) {
    if (!$event.node.key) {
      return;
    }
    this.onProjectChange.emit({ks: this.ks, old: this.ks.associatedProject.value, new: $event.node.key});
  }

  onTopicRemove() {
    this.ks.topics = this.keywords;
    this.onTopicChange.emit(this.ks);
  }

  onTopicAdd() {
    this.ks.topics = this.keywords;
    this.onTopicChange.emit(this.ks);
  }
}
