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
import {FormBuilder, FormGroup} from "@angular/forms";

@Component({
  selector: 'app-storage-settings',
  template: `
    <div class="p-fluid grid">
      <form [formGroup]="form" class="w-full h-full">
        <div class="col-12">
          <p-panel [toggleable]="true" toggler="header">
            <ng-template pTemplate="header">
              <div class="flex-row-center-between w-full">
                <div class="text-2xl">Import/Export</div>
              </div>
            </ng-template>
            <ng-template pTemplate="content">
              <div class="w-full h-full flex flex-column">
                <app-setting-template class="w-full" label="Export All">
                  <div class="settings-input">
                    <button pButton label="Export" [loading]="exporting" (click)="onExport($event, exportType)"></button>
                  </div>

                </app-setting-template>

                <p-divider layout="horizontal"></p-divider>

                <app-setting-template class="w-full" label="Import from File">
                  <div class="settings-input">
                    <input #importUpload class="hidden" (change)="onImport($event)" type="file">
                    <button pButton label="Import" (click)="importUpload.click()"></button>
                  </div>
                </app-setting-template>
              </div>
            </ng-template>
          </p-panel>
        </div>
      </form>
    </div>
  `,
  styles: []
})
export class StorageSettingsComponent implements OnInit {
  exportType: string = 'Everything';

  exporting: boolean = false;

  form: FormGroup;

  constructor(private storage: StorageService, private formBuilder: FormBuilder) {
    this.form = formBuilder.group({})
  }

  ngOnInit(): void {
  }

  async onExport($event: MouseEvent, exportType: string) {
    this.exporting = true;
    await this.storage.export();
    this.exporting = false;
  }

  onImport($event: any) {
    console.log('Import: ', $event);
    const files: any[] = $event.target.files;
    if (!files) {
      return;
    }

    console.log('Files: ', files);
    if (files.length > 1) {

    }

    const file: File = files[0];
    console.log('File: ', file);

    file.text().then((importFile) => {
      console.log('Import file size: ', importFile.length);

      const imported = JSON.parse(importFile);
      if (imported?.projects) {
        console.log('Imported: ', imported);

        const projects = imported.projects;
        let projectList: string[] = [];
        for (let project of projects) {
          projectList.push(project.id.value);
          const id = project.id.value;
          const pStr = JSON.stringify(project);
          if (pStr) {
            localStorage.setItem(id, pStr);
          }
        }

        const projectsStr = localStorage.getItem('kc-projects');
        if (projectsStr) {
          console.log('Adding to projects: ', projectsStr, projectList);
          let ids: string[] = JSON.parse(projectsStr);
          if (ids) {
            const nextIds = [];
            for (let id of ids) {
              nextIds.push(id);
            }
            for (let id of projectList) {
              nextIds.push(id);
            }
            ids.concat(projectList);
            let idStr = JSON.stringify(nextIds);
            console.log('Id strings: ', idStr);
            localStorage.setItem('kc-projects', idStr)
          }
        }
      }


    }).catch((error) => {
      console.error('Error on file read: ', error);
    })
  }
}
