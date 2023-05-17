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
  EventEmitter,
  Input,
  OnDestroy,
  Output,
} from '@angular/core';
import { CytoscapeLayout } from './graph.layouts';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subject, tap } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { SettingsService } from '@services/ipc-services/settings.service';

@Component({
  selector: 'graph-controls',
  template: `
    <div
      class="graph-controls border-1 border-primary-300 border-round-2xl p-3 surface-ground"
    >
      <div class="flex flex-row gap-2 justify-content-between">
        <div>
          <button
            pButton
            proTip
            tipHeader="Picture Perfect View 🌍"
            tipMessage="Feeling lost in your knowledge graph? Click 'Fit' to adjust and center your graph perfectly within your current view. It's like having a GPS for your data universe!"
            tipIcon="pi pi-arrows-alt"
            [tipGroups]="['graph']"
            icon="pi pi-arrows-alt"
            (click)="onFit.emit()"
          ></button>
        </div>
        <div class="graph-search">
          <form [formGroup]="form">
            <input
              class="w-full"
              #graphSearch
              pInputText
              formControlName="search"
              type="search"
              (keydown.enter)="onNext(graphSearch.value)"
              placeholder="Search"
              proTip
              tipHeader="Graph Search: Your Data Compass 🧭"
              tipMessage="Navigate your Knowledge universe with ease! Our graph search bar helps you find and highlight paths in your project hierarchy, while simultaneously showcasing matching sources as handy cards. Never lose track of a data point again!"
              tipIcon="pi pi-search"
              [tipGroups]="['graph']"
            />
          </form>
        </div>
      </div>

      <div class="flex flex-row gap-2 justify-content-between">
        <div class="flex">
          <button
            pButton
            icon="pi pi-download"
            class="p-button-secondary"
            (click)="onScreenshot.emit()"
          ></button>
        </div>

        <div class="flex w-full p-inputgroup">
          <p-dropdown
            [options]="layouts"
            [(ngModel)]="selectedLayout"
            [disabled]="running"
            optionLabel="name"
            class="w-full p-fluid flex"
            (onChange)="onLayout.emit(selectedLayout)"
            proTip
            tipHeader="Layouts: A Fresh Perspective 🔄"
            tipMessage="Bored of the same old view? Switch things up with our layout selector! Watch your knowledge graph morph instantly into your chosen layout. Feeling adventurous? Activate the physics simulator for a dynamic, animated experience!"
            tipIcon="pi pi-refresh"
            [tipGroups]="['graph']"
          >
          </p-dropdown>
          <span
            class="p-inputgroup-addon cursor-pointer"
            [class.p-disabled]="running"
            (click)="onRun.emit()"
          >
            <i class="pi pi-refresh"></i>
          </span>
        </div>

        <div class="flex">
          <button
            pButton
            icon="pi pi-cog"
            class="p-button-secondary"
            (click)="onSettings.emit()"
          ></button>
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
    `,
  ],
})
export class GraphControlsComponent implements OnDestroy {
  @Input() showSources = false;

  @Input() layouts: CytoscapeLayout[] = [];

  @Input() running = false;

  @Output() onFit = new EventEmitter();

  @Output() onScreenshot = new EventEmitter();

  @Output() onBack = new EventEmitter();

  @Output() onRun = new EventEmitter();

  @Output() onLayout = new EventEmitter<CytoscapeLayout>();

  @Output() onShowSources = new EventEmitter<boolean>();

  @Output() onSettings = new EventEmitter();

  @Output() onStop = new EventEmitter();

  @Output() onSearch = new EventEmitter<string>();

  @Output() onSearchNext = new EventEmitter<string>();

  @Output() onSearchPrevious = new EventEmitter<string>();

  selectedLayout: CytoscapeLayout = this.layouts[0];

  form: FormGroup;

  private cleanUp: Subject<any> = new Subject<any>();

  private timeout?: any = undefined;

  constructor(
    private formBuilder: FormBuilder,
    private settings: SettingsService
  ) {
    this.form = formBuilder.group({
      search: [''],
    });

    this.form.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged((previous, current) => {
          return previous.search === current.search;
        }),
        map((fv) => fv.search),
        tap((term) => {
          this.onSearch.emit(term);
        })
      )
      .subscribe();
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
      this.timeout = setTimeout(
        () => {
          this.timeout = undefined;
        },
        this.settings.get().app.graph.animation.enabled ? 50 : 0
      );
    }
  }
}
