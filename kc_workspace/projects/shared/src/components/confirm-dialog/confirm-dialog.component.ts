/// Reference: https://itnext.io/building-a-reusable-dialog-module-with-angular-material-4ce406117918
import {Component, HostListener, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: {
                cancelText: string,
                confirmText: string,
                message: string,
                title: string,
                list: any[],
                action: 'delete' | 'confirm'
              },
              private mdDialogRef: MatDialogRef<ConfirmDialogComponent>) {
  }

  ngOnInit(): void {
  }

  public cancel(): void {
    this.close(false);
  }

  public close(value: any): void {
    this.mdDialogRef.close(value);
  }

  public confirm(): void {
    this.close(true);
  }

  @HostListener('keydown.esc')
  public onEsc(): void {
    this.close(false);
  }
}
