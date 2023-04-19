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

import {Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges} from '@angular/core';
import {Subject} from "rxjs";
import {KnowledgeSource} from "@app/models/knowledge.source.model";
import {animate, style, transition, trigger} from "@angular/animations";
import {KsCommandService} from "@services/command-services/ks-command.service";
import {TopicService} from "@services/user-services/topic.service";
import {SettingsService} from "@services/ipc-services/settings.service";

export interface SearchResult {
  index: number
  score: number
}

@Component({
  selector: 'graph-search',
  template: `
    <div class="graph-search border-1 border-primary-300 border-round-2xl surface-ground p-1"
         [style.max-height]="layout.minimal ? 'min(25vh, 18rem)' : 'min(50vh, 38rem)'">
      <div *ngIf="sources && sources.length > 0" @grow class="w-full overflow-y-auto bg-transparent">
        <div
          class="graph-search-header w-full flex flex-column justify-content-center align-items-end absolute p-2 z-2">
          <div class="surface-hover border-round-top-2xl">
            <p-selectButton [options]="layoutOptions" [(ngModel)]="layout" optionLabel="icon"
                            (onChange)="onLayoutChange()">
              <ng-template let-item>
                <i [class]="item.icon"></i>
              </ng-template>
            </p-selectButton>
          </div>
        </div>
        <div *ngFor="let source of sources; let i = index; let first = first; let last = last;"
             class="pb-2"
             [class.pb-8]="last">
          <div *ngIf="layout.minimal else full">
            <app-ks-message [active]="selectedIndex === i"
                            [animate]="false"
                            [class.active-source]="selectedIndex === i"
                            *ngIf="source.title.length > 0"
                            label="#{{i+1}} of {{sources.length}}"
                            [showDate]="false"
                            (click)="source.index = i; onResultClicked.emit(source)"
                            (contextmenu)="onContextMenu.emit({data: [source], event: $event})"
                            [ks]="source">
            </app-ks-message>
          </div>
          <ng-template #full>
            <div>
              <app-ks-card [ks]="source"
                           descriptionPlaceholder=""
                           class="graph-search-result"
                           label="#{{i+1}} of {{sources.length}}"
                           [class.active-source]="selectedIndex === i"
                           [class.pb-4]="last"
                           (click)="source.index = i; onResultClicked.emit(source)"
                           (contextmenu)="onContextMenu.emit({data: [source], event: $event})"
                           (onEdit)="onEdit($event)"
                           (onOpen)="onOpen($event)"
                           (onPreview)="onPreview($event)"
                           (onRemove)="onRemove($event)"
                           (onTopicClick)="onTopic($event)">
              </app-ks-card>
            </div>
          </ng-template>
        </div>
      </div>


      <div class="w-full text-center pb-1" [class.pt-2]="sources && sources.length > 0">
        <div *ngIf="sources && sources.length > 0 else footer" class="w-full flex-row-center-between px-4 text-600">
          <div class="pi pi-arrow-left cursor-pointer" (click)="onNext.emit(true)" pTooltip="Previous: ⌘/Ctrl+["></div>
          <div class="pi pi-arrow-right cursor-pointer" (click)="onNext.emit()" pTooltip="Next: ⌘/Ctrl+]"></div>
        </div>
        <ng-template #footer>
          <div>
            {{footerText}}
          </div>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    .graph-search {
      min-width: 12rem;
      width: min(38vw, 26rem);
      max-width: min(38vw, 26rem);
      display: flex;
      position: absolute;
      right: 1rem;
      bottom: 5rem;
      flex-direction: column;
      flex-wrap: nowrap;
      align-content: center;
      justify-content: space-between;
      z-index: 99;
    }

    .graph-search-small {
      max-height: min(25vh, 18rem);
    }

    .graph-search-large {
      max-height: min(50vh, 38rem);
    }

    .graph-search-result {
      max-height: 38rem;
    }

    .graph-search-header {
      top: -3.5rem;
    }
  `],
  animations: [
    trigger("grow", [
      transition(":enter", [
        style({height: "0"}),
        animate(500, style({height: "*"}))
      ]),
      transition(":leave", [
        animate(500, style({height: 0}))
      ])
    ])
  ]
})
export class GraphSearchComponent implements OnInit, OnDestroy, OnChanges {
  @Input() sources: (KnowledgeSource & SearchResult)[] = [];

  @Input() footerText: string = '';

  @Input() selectedIndex: number = 0;

  @Output() onResultClicked = new EventEmitter<KnowledgeSource & SearchResult>;

  @Output() onContextMenu = new EventEmitter<{ data: KnowledgeSource[], event: MouseEvent }>;

  @Output() onNext = new EventEmitter<boolean>();

  layoutOptions = [
    {icon: 'pi pi-tablet', minimal: false},
    {icon: 'pi pi-list', minimal: true}
  ];

  layout = this.layoutOptions[0];

  private cleanUp: Subject<any> = new Subject<any>();

  constructor(private command: KsCommandService, private topic: TopicService, private settings: SettingsService) {
  }

  ngOnInit(): void {
    try {
      const minimal = JSON.parse(localStorage.getItem('graph-search-minimal') ?? '') ?? false;
      this.layout = this.layoutOptions.find(l => l.minimal == minimal) ?? this.layoutOptions[0];
      this.onLayoutChange();
    } catch (e) {
      this.layout = this.layoutOptions.find(l => l.minimal) ?? this.layoutOptions[0];
      this.onLayoutChange();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.selectedIndex?.currentValue !== undefined) {
      this.scroll()
    }
  }

  scroll(timeoutms: number = 100) {
    let scrollArgs: any = {behavior: 'smooth'}
    if (!this.settings.get().app.graph.animation.enabled) {
      scrollArgs = {};
    }

    setTimeout(() => {
      const classElement = document.getElementsByClassName('active-source');
      if (classElement.length > 0) {
        classElement[0].scrollIntoView(scrollArgs);
      }
    }, timeoutms)
  }

  ngOnDestroy() {
    this.cleanUp.next({});
    this.cleanUp.complete();
  }

  onEdit($event: KnowledgeSource) {
    this.command.detail($event);
  }

  onOpen($event: KnowledgeSource) {
    this.command.open($event);
  }

  onPreview($event: KnowledgeSource) {
    this.command.preview($event);
  }

  onRemove($event: KnowledgeSource) {
    this.command.remove([$event]);
  }


  onTopic($event: { ks: KnowledgeSource; topic: string }) {
    this.topic.search($event.topic);
  }

  onLayoutChange() {
    localStorage.setItem('graph-search-minimal', JSON.stringify(this.layout.minimal));
    this.scroll();
  }
}
