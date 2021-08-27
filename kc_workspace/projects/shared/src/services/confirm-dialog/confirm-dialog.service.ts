/// Reference: https://itnext.io/building-a-reusable-dialog-module-with-angular-material-4ce406117918
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {ConfirmDialogComponent} from '../../components/confirm-dialog/confirm-dialog.component';
import {map, take} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ConfirmDialogService {
  dialogRef: MatDialogRef<ConfirmDialogComponent> | null;

  constructor(private dialog: MatDialog) {
    this.dialogRef = null;
  }

  public open(options: any): void {
    this.dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: options.title,
        message: options.message,
        cancelText: options.cancelText,
        confirmText: options.confirmText,
        list: options.list,
        action: options.action
      }
    });
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
