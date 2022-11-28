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

import {Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges} from '@angular/core';
import {CytoscapeLayout} from "./graph.layouts";
import {FormBuilder, FormGroup} from "@angular/forms";
import {Subject, tap} from "rxjs";
import {debounceTime, distinctUntilChanged, map} from "rxjs/operators";
import {SettingsService} from "../../services/ipc-services/settings.service";


@Component({
  selector: 'graph-controls',
  template: `
    <div class="graph-controls border-1 border-primary-300 border-round-2xl p-3 surface-ground">
      <div class="flex flex-row gap-2 justify-content-between">
        <div>
          <button pButton icon="pi pi-arrows-alt" (click)="onFit.emit()"></button>
        </div>
        <div class="graph-search">
          <form [formGroup]="form">
            <input class="w-full"
                   #graphSearch
                   pInputText
                   formControlName="search"
                   type="search"
                   (keydown.enter)="onNext(graphSearch.value)"
                   placeholder="Search">
          </form>
        </div>
      </div>

      <div class="flex flex-row gap-2 justify-content-between">
        <div class="flex">
          <button pButton icon="pi pi-download" (click)="onScreenshot.emit()"></button>
        </div>

        <div class="flex w-full p-inputgroup">
          <p-dropdown [options]="layouts"
                      [(ngModel)]="selectedLayout"
                      [disabled]="running"
                      optionLabel="name"
                      class="w-full p-fluid flex"
                      (onChange)="onLayout.emit(selectedLayout)">
          </p-dropdown>
          <span class="p-inputgroup-addon cursor-pointer" [class.p-disabled]="running" (click)="onRun.emit()">
            <i class="pi pi-refresh"></i>
          </span>
        </div>

        <div class="flex">
          <button pButton icon="pi pi-cog" (click)="onSettings.emit()"></button>
        </div>
      </div>
      <div class="graph-status">
        <div class="pt-2 flex flex-row justify-content-between align-items-center text-500">
          <div #run *ngIf="running else done">Running... ({{runtime | number: '1.1'}}s elapsed)</div>
          <ng-template #done>Done</ng-template>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .graph-controls {
        min-width: 12rem;
        width: 26rem;
        max-width: 36rem;
        display: flex;
        position: absolute;
        right: 1rem;
        top: 1rem;
        flex-direction: column;
        flex-wrap: nowrap;
        align-content: center;
        justify-content: space-between;
        z-index: 99;
      }

      .graph-search {
        width: 100%;
        padding-bottom: 1rem;
      }

      .graph-status {
        height: 1rem;
      }
    `
  ]
})
export class GraphControlsComponent implements OnInit, OnChanges, OnDestroy {
  @Input() showSources: boolean = false;

  @Input() layouts: CytoscapeLayout[] = [];

  @Input() running: boolean = false;

  @Output() onFit = new EventEmitter();

  @Output() onScreenshot = new EventEmitter();

  @Output() onBack = new EventEmitter();

  @Output() onRun = new EventEmitter();

  @Output() onLayout = new EventEmitter<CytoscapeLayout>();

  @Output() onShowSources = new EventEmitter<boolean>();

  @Output() onSettings = new EventEmitter();

  @Output() onStop = new EventEmitter();

  @Output() onSearch = new EventEmitter<string>();

  @Output() onSearchNext = new EventEmitter<string>()

  @Output() onSearchPrevious = new EventEmitter<string>();

  selectedLayout: CytoscapeLayout = this.layouts[0];

  runtime: number = 0;

  runtimeInterval: any;

  form: FormGroup;

  private cleanUp: Subject<any> = new Subject<any>();

  private timeout?: any = undefined;


  constructor(private formBuilder: FormBuilder, private settings: SettingsService) {
    this.form = formBuilder.group({
      search: ['']
    })

    this.form.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged((previous, current) => {
        return previous.search === current.search;
      }),
      map(fv => fv.search),
      tap((term) => {
        this.onSearch.emit(term)
      })
    ).subscribe()
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes?.running?.currentValue !== undefined) {
      if (changes?.running?.currentValue) {
        this.runtime = 0;
        this.runtimeInterval = setInterval(() => {
          this.runtime += 0.5;
        }, 500)
      } else {
        if (this.runtimeInterval) {
          clearInterval(this.runtimeInterval);
        }
      }
    }
  }

  ngOnDestroy() {
    this.cleanUp.next({});
    this.cleanUp.complete();
  }

  onNext(value: string) {
    if (this.timeout) {
      return;
    } else {
      this.onSearchNext.emit(value);
      this.timeout = setTimeout(() => {
        this.timeout = undefined;
      }, this.settings.get().app.graph.animation.enabled ? 50 : 0)
    }
  }
}
