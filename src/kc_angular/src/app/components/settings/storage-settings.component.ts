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

import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-storage-settings',
  template: `
    <div class="p-fluid grid">
      <div class="col-12">
        <p-panel header="Storage">
          <ng-template pTemplate="content">
            <ul>
              <li>Local Storage</li>
              <li>MongoDB (eventually)</li>
              <li>Elasticsearch/OpenSearch (eventually)</li>
              <li>Backups (eventually)</li>
              <li>Clean up dangling objects in localStorage</li>
            </ul>
          </ng-template>
        </p-panel>
      </div>
    </div>
  `,
  styles: []
})
export class StorageSettingsComponent implements OnInit {

  constructor() {
  }

  ngOnInit(): void {
  }

}
