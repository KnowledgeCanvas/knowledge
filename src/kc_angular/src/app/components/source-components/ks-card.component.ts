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


import {Component, EventEmitter, HostListener, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges} from '@angular/core';
import {KnowledgeSource} from "../../models/knowledge.source.model";
import {TreeNode} from "primeng/api";
import {Subscription} from "rxjs";
import {UUID} from "../../../../../kc_shared/models/uuid.model";
import {KsCommandService} from "../../services/command-services/ks-command.service";


@Component({
  selector: 'app-ks-card',
  template: `
    <div [class]="hovering ? 'shadow-3' : 'shadow-1'"
         *ngIf="ks"
         style="border: 1px dotted var(--surface-400); border-radius: 5px;">
      <p-card (dblclick)="onEdit.emit(ks)" [style]="{'min-height': '12rem'}">
        <ng-template pTemplate="header">
          <app-ks-thumbnail *ngIf="showThumbnail" [ks]="ks"></app-ks-thumbnail>
        </ng-template>

        <ng-template pTemplate="content">
          <div class="flex-row-center-between">
        <span class="font-bold text-xl cursor-pointer"
              (click)="onEdit.emit(this.ks)" [pTooltip]="ks.title">
          {{ks.title |truncate: [truncate ? 28 : 128]}}
        </span>
            <i *ngIf="showContentType"
               class="pi pi-{{ks.ingestType | ksIngestTypeIcon}}"
               [pTooltip]="ks.ingestType | titlecase">
            </i>
          </div>

          <div *ngIf="showProjectBreadcrumbs" class="text-500">
            {{ks.associatedProject | projectBreadcrumb: 'truncated'}}
          </div>

          <div *ngIf="showDescription">
            <div *ngIf="description" class="text-500" style="height: 4rem">
              {{description | truncate: [truncate ? 32 : 128]}}
            </div>
            <div *ngIf="!description" class="text-500" style="height: 4rem">
              Double-click to add a description
            </div>
          </div>

          <div class="col-12" *ngIf="showProjectSelection && projectTreeNodes.length">
            <p-treeSelect [(ngModel)]="selectedProject"
                          [options]="projectTreeNodes"
                          selectionMode="single"
                          class="p-fluid w-full"
                          (onNodeSelect)="onProjectSelected($event)"
                          appendTo="body"
                          placeholder="Choose a Project">
            </p-treeSelect>

          </div>

          <div *ngIf="showTopics"
               [style]="{'height':'5rem', 'overflow-y': 'auto', 'overflow-x': 'hidden'}">
            <p-chips [allowDuplicate]="false"
                     [addOnBlur]="true"
                     [addOnTab]="true"
                     (onChipClick)="onTopicClick.emit({ks: ks, topic: $event.value})"
                     (onAdd)="onTopicAdd()"
                     (onRemove)="onTopicRemove()"
                     [(ngModel)]="keywords"
                     class="p-fluid w-full"
                     placeholder="Start typing to add a topic...">
            </p-chips>
          </div>

          <div *ngIf="showIcon || showRemove || showOpen || showEdit || showPreview || showFlag"
               class="flex-row-center-between">
            <div class="col text-left">
              <app-ks-icon [ks]="ks" *ngIf="showIcon"></app-ks-icon>
            </div>
            <div *ngIf="showRemove || showOpen || showEdit || showPreview || showFlag">
              <app-action-bar [showEdit]="showEdit"
                              [showPreview]="showPreview"
                              [showOpen]="showOpen"
                              [showRemove]="showRemove"
                              [showFlag]="showFlag"
                              [flagged]="ks.flagged"
                              (onEdit)="onEdit.emit(this.ks)"
                              (onPreview)="onPreview.emit(this.ks)"
                              (onOpen)="onOpen.emit(this.ks)"
                              (onRemove)="onRemove.emit(this.ks)"
                              (onFlagged)="onFlagged(this.ks, $event.checked)">
              </app-action-bar>
            </div>
          </div>
        </ng-template>
      </p-card>
    </div>

  `,
  styles: [
    `
      ::ng-deep {
      .p-chips-token {
        cursor: pointer;
      }
    }
    `
  ]
})
export class KsCardComponent implements OnInit, OnDestroy, OnChanges {
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
  @Input() currentProject?: UUID | null;

  /**
   * Determines whether to display KS thumbnail in header (default: true)
   */
  @Input() showThumbnail: boolean = true;

  /**
   * Determines whether to display KS description (default: true)
   */
  @Input() showDescription: boolean = true;

  /**
   * Determines whether to display Project selector (default: false)
   */
  @Input() showProjectSelection: boolean = false;

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
   * Determines whether to display the "Important" button (default: true)
   */
  @Input() showFlag: boolean = true;

  /**
   * Determines whether to show Content Type property (default: true)
   */
  @Input() showContentType: boolean = true;

  /**
   * Determines whether to show KS icon (default: true)
   */
  @Input() showIcon: boolean = true;

  /**
   * Determines whether to truncate certain fields to avoid spilling text, etc (default: true)
   */
  @Input() truncate: boolean = true;

  /**
   * Determines whether to show name of the Associated Project (default: false)
   */
  @Input() showProjectBreadcrumbs: boolean = false;

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

  hovering: boolean = false;

  contentType?: string;

  keywords?: string[];

  description?: string;

  actionButtonTooltipOptions = {
    showDelay: 750,
    tooltipPosition: 'top'
  };

  private _subProjectTree?: Subscription;

  constructor(private command: KsCommandService) {
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.ks?.currentValue) {
      this.getContentType().then((result) => {
        this.contentType = result;
      });

      this.getKeywords().then((result) => {
        this.keywords = result;
      });

      this.getDescription().then((result) => {
        this.description = result;
      });
    }
  }

  ngOnDestroy() {
    if (this._subProjectTree) {
      this._subProjectTree.unsubscribe();
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
    this.command.update([this.ks]);
  }

  onTopicAdd() {
    this.ks.topics = this.keywords;
    this.command.update([this.ks]);
  }

  onFlagged(ks: KnowledgeSource, flagged: boolean) {
    this.ks.flagged = flagged;
    this.command.update([ks]);
  }
}
