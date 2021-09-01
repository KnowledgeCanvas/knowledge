/// Reference: https://itnext.io/building-a-reusable-dialog-module-with-angular-material-4ce406117918
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {ConfirmDialogComponent} from '../../components/dialogs/confirm-dialog/confirm-dialog.component';
import {map, take} from 'rxjs/operators';

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

  public open(options: KcDialogRequest): void {
    this.dialogRef = this.dialog.open(ConfirmDialogComponent, {data: options});
  }

  public confirmed(): Observable<any> {
    if (this.dialogRef != null) {
      return this.dialogRef.afterClosed().pipe(take(1), map(res => {
          return res;
        }
      ));
    } else {
      return new Observable<any>();
    }

  }
}
