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

import {Component, Inject, OnInit} from '@angular/core';
import {MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef} from "@angular/material/bottom-sheet";
import {FormControl} from "@angular/forms";
import {WellnessSettingsModel} from "../../models/settings.model";

@Component({
  selector: 'ks-lib-digital-wellness-settings',
  templateUrl: './digital-wellness-settings.component.html',
  styleUrls: ['./digital-wellness-settings.component.css']
})
export class DigitalWellnessSettingsComponent implements OnInit {
  minutes = new FormControl();
  seconds = new FormControl();
  breakMinutes = new FormControl();
  breakSeconds = new FormControl();
  autostartAfterBreak: boolean = false
  allowOverride: boolean = true;


  constructor(private bottomSheetRef: MatBottomSheetRef, @Inject(MAT_BOTTOM_SHEET_DATA) public data: WellnessSettingsModel) {
    this.minutes.setValue(data.timerMinutes);
    this.seconds.setValue(data.timerSeconds);
    this.breakMinutes.setValue(data.breakMinutes);
    this.breakSeconds.setValue(data.breakSeconds);
    this.autostartAfterBreak = data.autostartAfterBreak;
    this.allowOverride = data.allowOverride;
  }

  ngOnInit(): void {
  }

  submit() {
    let timerSecondsTotal = (this.minutes.value * 60) + this.seconds.value;
    let breakSecondsTotal = (this.breakMinutes.value * 60) + this.breakSeconds.value;

    if (timerSecondsTotal < 60) {
      this.minutes.setValue(1);
      this.seconds.setValue(0);
    }

    if (breakSecondsTotal < 60) {
      this.breakMinutes.setValue(1);
      this.breakSeconds.setValue(0);
    }

    let result = {
      timerMinutes: this.minutes.value,
      timerSeconds: this.seconds.value,
      breakMinutes: this.breakMinutes.value,
      breakSeconds: this.breakSeconds.value,
      autostartAfterBreak: this.autostartAfterBreak,
      allowOverride: this.allowOverride
    }
    this.bottomSheetRef.dismiss(result)
  }

  cancel() {
    this.bottomSheetRef.dismiss();
  }
}
