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
import {StorageService} from "../../services/ipc-services/storage.service";

@Component({
  selector: 'app-storage-settings',
  template: `
    <div class="p-fluid grid">
      <div class="col-12">
        <p-panel header="Import/Export">
          <ng-template pTemplate="content">
            <div class="p-fluid grid mt-1">
              <div class="col-4">
                <button pButton label="Export" [loading]="exporting" (click)="onExport($event, exportType)"></button>
              </div>
            </div>
          </ng-template>
        </p-panel>
      </div>
    </div>
  `,
  styles: []
})
export class StorageSettingsComponent implements OnInit {
  exportType: string = 'Everything';

  exporting: boolean = false;

  constructor(private storage: StorageService) {
  }

  ngOnInit(): void {
  }

  async onExport($event: MouseEvent, exportType: string) {
    this.exporting = true;
    await this.storage.export();
    this.exporting = false;
  }
}
