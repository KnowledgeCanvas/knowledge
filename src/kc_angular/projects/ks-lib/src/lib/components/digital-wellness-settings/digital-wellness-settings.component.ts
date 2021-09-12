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
