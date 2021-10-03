/**
 Copyright 2021 Rob Royce

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

import {Injectable} from '@angular/core';
import {KnowledgeSource} from "../models/knowledge.source.model";
import {KsInfoDialogComponent, KsInfoDialogInput, KsInfoDialogOutput} from "../../../../main/src/app/knowledge-source/ks-info-dialog/ks-info-dialog.component";
import {MatDialog} from "@angular/material/dialog";

@Injectable({
  providedIn: 'root'
})
export class KsInfoDialogService {

  constructor(private dialog: MatDialog) {
  }

  open(ks: KnowledgeSource, projectId?: string): Promise<KsInfoDialogOutput> {

    let dialogInput: KsInfoDialogInput = {
      source: 'ks-drop-list',
      ks: ks,
      projectId: projectId
    }

    return new Promise<KsInfoDialogOutput>((resolve) => {
      const dialogRef = this.dialog.open(KsInfoDialogComponent, {
        minWidth: '65vw',
        width: 'auto',
        height: 'auto',
        maxHeight: '90vh',
        data: dialogInput,
        autoFocus: false
      });

      dialogRef.afterClosed().subscribe((result: KsInfoDialogOutput) => {
        resolve(result);
      })
    })
  }
}
