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

/// Reference: https://itnext.io/building-a-reusable-dialog-module-with-angular-material-4ce406117918
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {ConfirmDialogComponent} from '../../components/dialogs/confirm-dialog/confirm-dialog.component';
import {map, take} from 'rxjs/operators';
import {KnowledgeSource} from "../../models/knowledge.source.model";

export interface KcDialogRequest {
  actionToTake: 'delete' | 'confirm' | 'delete-input-required'
  title: string,
  message: string,
  listToDisplay?: any[],
  cancelButtonText: string,
  actionButtonText: string,
  expectedInput?: string
}

@Injectable({
  providedIn: 'root'
})
export class KcDialogService {
  dialogRef: MatDialogRef<ConfirmDialogComponent> | null;

  constructor(private dialog: MatDialog) {
    this.dialogRef = null;
  }

  public openWarnDeleteKs(ks: KnowledgeSource): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      let options: KcDialogRequest = {
        actionButtonText: "Remove",
        actionToTake: 'delete',
        cancelButtonText: "Cancel",
        listToDisplay: [ks],
        message: "Are you sure you want to remove this knowledge source?",
        title: `Remove ${ks.title}?`

      }
      let dialogRef = this.dialog.open(ConfirmDialogComponent, {data: options});
      dialogRef.afterClosed().subscribe((result) => {
        resolve(result);
      })
    })
  }

  public open(options: KcDialogRequest): void {
    this.dialogRef = this.dialog.open(ConfirmDialogComponent, {data: options});
  }

  public confirmed(): Observable<boolean> {
    if (this.dialogRef != null) {
      return this.dialogRef.afterClosed().pipe(take(1), map(res => {
          return res;
        }
      ));
    } else {
      return new Observable<boolean>();
    }

  }
}
