/// Reference: https://itnext.io/building-a-reusable-dialog-module-with-angular-material-4ce406117918
import {Component, HostListener, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {KcDialogRequest} from "../../../../ks-lib/src/lib/services/dialog/kc-dialog.service";

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent implements OnInit {
  request: KcDialogRequest;
  buttonsDisabled: boolean = false;
  inputText: string = '';

  constructor(@Inject(MAT_DIALOG_DATA) public data: KcDialogRequest,
              private mdDialogRef: MatDialogRef<ConfirmDialogComponent>) {
    this.request = data;
    if (data.actionToTake === 'delete-input-required')
      this.buttonsDisabled = true;
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

  inputChanged() {
    this.buttonsDisabled = this.inputText !== this.request.expectedInput;
  }
}
