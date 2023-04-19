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
import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { KnowledgeSource } from '../models/knowledge.source.model';
import { Observable, Subject, tap } from 'rxjs';
import { DataService } from '@services/user-services/data.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-table',
  template: `
    <div class="h-full w-full flex-col-center-center">
      <div
        class="width-constrained w-full h-full flex-col-center-between surface-section p-4"
      >
        <ks-table
          class="w-full h-full"
          [ksList]="(sources | async)!"
        ></ks-table>
      </div>
    </div>
  `,
  styles: [],
})
export class TableComponent implements OnDestroy {
  sources: Observable<KnowledgeSource[]>;

  projectId = '';

  private cleanUp: Subject<any> = new Subject();

  constructor(private data: DataService, private route: ActivatedRoute) {
    route.paramMap
      .pipe(
        takeUntil(this.cleanUp),
        tap((params) => {
          this.projectId = params.get('projectId') ?? '';
        })
      )
      .subscribe();

    this.sources = data.ksList;
  }

  ngOnDestroy() {
    this.cleanUp.next({});
    this.cleanUp.complete();
  }
}
