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
import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {KnowledgeSource} from "../models/knowledge.source.model";
import {Subscription} from "rxjs";
import {DataService} from "../services/user-services/data.service";

@Component({
  selector: 'app-table',
  template: `
    <div class="h-full w-full flex-col-center-center">
      <div class="w-full h-full flex-col-center-between surface-section p-4" [style]="{'max-width': 'min(100%, 96rem)'}">
        <ks-table class="w-full h-full" [ksList]="ksList"></ks-table>
      </div>
    </div>
  `,
  styles: []
})
export class TableComponent implements OnInit, OnDestroy {
  ksList: KnowledgeSource[] = [];

  projectId: string = '';

  private subscription: Subscription;

  constructor(private data: DataService, private route: ActivatedRoute) {
    this.subscription = route.paramMap.subscribe((params) => {
      this.projectId = params.get('projectId') ?? '';
    })

    data.ksList.subscribe((ksList) => {
      this.ksList = ksList;
    });
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
