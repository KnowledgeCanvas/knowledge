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
import {Component, Input, OnInit} from '@angular/core';
import {KnowledgeSource} from "@app/models/knowledge.source.model";
import {DragAndDropService} from "@services/ingest-services/drag-and-drop.service";
import {KsCommandService} from "@services/command-services/ks-command.service";
import {SettingsService} from "@services/ipc-services/settings.service";

@Component({
  selector: 'app-ks-icon',
  template: `
    <div class="w-full h-full relative">
      <img [src]="ks && ks.icon ? ks.icon : iconUrl"
           class="knowledge-source-icon bg-white"
           width="24"
           [style.cursor]="ks && ks.ingestType && ks.ingestType === 'file' ? 'grab' : 'pointer'"
           [class.shadow-3]="showShadow"
           [class.bg-auto]="autoBackgroundColor"
           [class.icon-rotate-animation]="animate"
           (click)="onClick()"
           draggable="true"
           (dragstart)="onDragStart($event, ks)"
           pTooltip="{{allowClickThrough ? (ks && ks.ingestType === 'file' ? 'Click to open, drag to copy' : 'Click to open') : ''}}"
           [tooltipOptions]="{showDelay: 750, tooltipStyleClass: ks && ks.ingestType === 'file' ? 'ks-file-icon-tooltip' : 'ks-icon-tooltip'}"
           tooltipPosition="bottom"
           alt="Knowledge Source Icon">
      <div *ngIf="showDuedate && ks && ks.dateDue" class="due-indicator" [class.due-future]="!pastDue"
           [class.due-past]="pastDue"
           [pTooltip]="pastDue ? 'Past due by ' + (ks.dateDue | countdown) : 'Due in ' + (ks.dateDue | countdown)">
        <div class="pi pi-calendar"></div>
      </div>
    </div>
  `,
  styles: [
    `
      ::ng-deep {
        .ks-file-icon-tooltip {
          max-width: 15rem !important;
        }
      }

      .due-indicator {
        position: absolute;
        width: 12px;
        height: 12px;
        bottom: 0;
        left: 24px;
      }

      .due-past {
        color: var(--red-500);
      }

      .due-future {
        color: var(--primary-color);
      }
    `
  ]
})
export class KsIconComponent implements OnInit {
  @Input() ks?: Partial<KnowledgeSource> | null;

  /**
   * Enable or disable the ability to open a source by clicking its icon.
   *
   * Default: true
   */
  @Input() allowClickThrough: boolean = true;

  @Input() iconUrl?: string;

  @Input() showEditor: boolean = true;

  @Input() showShadow: boolean = true;

  @Input() autoBackgroundColor: boolean = true;

  @Input() animate: boolean = true;

  @Input() showDuedate: boolean = true;

  pastDue: boolean = false;

  constructor(private dnd: DragAndDropService, private command: KsCommandService, private settings: SettingsService) {
  }

  ngOnInit(): void {
    this.animate = this.settings.get().display.animations;

    if (this.ks?.dateDue) {
      this.pastDue = new Date > this.ks.dateDue;
    }
  }

  onDragStart($event: DragEvent, ks?: Partial<KnowledgeSource> | null) {
    if (ks !== null) {
      this.dnd.dragOut($event, ks);
    }
  }

  onClick() {
    if (this.ks && this.allowClickThrough) {
      this.command.open(this.ks);
    }
  }
}
