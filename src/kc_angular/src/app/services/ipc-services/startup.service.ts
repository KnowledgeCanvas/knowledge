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
import { Injectable } from '@angular/core';
import { ElectronIpcService } from './electron-ipc.service';
import { Observable } from 'rxjs';
import { DialogService } from 'primeng/dynamicdialog';
import { TutorialComponent } from '@components/shared/tutorial.component';

@Injectable({
  providedIn: 'root',
})
export class StartupService {
  constructor(private dialog: DialogService, private ipc: ElectronIpcService) {
    this.ipc.version.subscribe((version) => {
      if (!version || version === '') {
        return;
      }

      let major, minor, patch;
      [major, minor, patch] = version.split('.');

      // this.storage.getProjects().then((projects) => {
      //   for (let project of projects) {
      //     console.log('Analyzing project: ', project.name);
      //     for (let ks of project.knowledgeSource) {
      //       console.log('\t\tAnalyzing KS: ', ks.title);
      //
      //       // First, check if KS exists in local storage. If it does, then we are done here.
      //       const lookup = `ks-${ks.id.value}`;
      //       const kstr = localStorage.getItem(lookup);
      //
      //       // If it does not exist in local storage, save it
      //       if (!kstr) {
      //         const kson = JSON.stringify(ks);
      //         if (kson) {
      //           localStorage.setItem(lookup, kson);
      //         }
      //       }
      //
      //       if (project.sources && !project.sources.find(k => k.value === ks.id.value)) {
      //         project.sources.push(ks.id);
      //       } else {
      //         project.sources = [ks.id];
      //       }
      //     }
      //
      //     this.storage.saveProject(project);
      //   }
      // })
    });

    this.ipc.getCurrentVersion();
  }

  tutorial(): Observable<boolean> {
    return new Observable<boolean>((subscriber) => {
      const ref = this.dialog.open(TutorialComponent, {
        width: 'min(90%, 64rem)',
        showHeader: false,
        closable: true,
        closeOnEscape: true,
        contentStyle: {
          'border-radius': '6px',
        },
      });

      ref.onClose.subscribe((result) => {
        subscriber.next(result);
        subscriber.complete();
      });
    });
  }
}
