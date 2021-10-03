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
import {Component, HostListener, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {KcDialogRequest} from "../../../services/dialog/kc-dialog.service";

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
