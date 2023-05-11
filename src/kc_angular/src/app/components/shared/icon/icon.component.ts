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

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IconService } from '@services/user-services/icon.service';
import { PrimeIcons } from 'primeng/api';
import { OverlayPanel } from 'primeng/overlaypanel';
import { FormBuilder, FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';

@Component({
  selector: 'app-icon',
  template: `
    <div
      (click)="op.show($event)"
      class="flex-row-center-center cursor-pointer border-round-2xl hover:surface-card shadow-2"
    >
      <a class="h-3rem text-3xl w-3rem flex-row-center-center {{ icon }}"></a>
    </div>
    <p-overlayPanel #op styleClass="h-30rem w-30rem overflow-y-auto">
      <div class="flex-col-center-center">
        <form [formGroup]="form" class="w-full">
          <input
            pInputText
            placeholder="Filter..."
            formControlName="filter"
            class="w-full"
          />
        </form>
        <div class="max-w-30rem flex-wrap gap-4 flex-row-center-center">
          <a
            *ngFor="let i of filteredIcons"
            [ngClass]="i"
            class="h-3rem w-3rem text-3xl hover:surface-hover cursor-pointer flex-row-center-center"
            (click)="change(i, op)"
          ></a>
          <div *ngIf="filteredIcons.length === 0">
            <p>No icons found</p>
          </div>
        </div>
      </div>
    </p-overlayPanel>
  `,
  styles: [
    `
      :host {
        width: 3rem !important;
        height: 3rem !important;
        margin-left: 0.5rem !important;
      }
    `,
  ],
})
export class IconComponent {
  @Input() icon?: string = PrimeIcons.FOLDER;

  @Output() changed = new EventEmitter();

  form: FormGroup;

  filteredIcons: string[] = this.icons.iconValues;

  constructor(private icons: IconService, private fb: FormBuilder) {
    this.form = fb.group({
      filter: [''],
    });

    this.form.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        tap((formValue) => {
          this.filteredIcons = this.icons.iconValues.filter((i) =>
            i.includes(formValue.filter)
          );
        })
      )
      .subscribe();
  }

  change(i: any, op: OverlayPanel) {
    this.icon = i;
    op.hide();
    this.changed.emit(i);
  }
}
