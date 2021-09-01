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
  autostartAfterBreak = new FormControl();
  allowOverride = new FormControl();


  constructor(private bottomSheetRef: MatBottomSheetRef, @Inject(MAT_BOTTOM_SHEET_DATA) public data: WellnessSettingsModel) {
    this.minutes.setValue(data.timerMinutes);
    this.seconds.setValue(data.timerSeconds);
    this.breakMinutes.setValue(data.breakMinutes);
    this.breakSeconds.setValue(data.breakSeconds);
    this.autostartAfterBreak.setValue(data.autostartAfterBreak);
    this.allowOverride.setValue(data.allowOverride);

    console.log('Wellness settings received data: ', data);
  }

  ngOnInit(): void {
  }

  submit() {
    let result = {
      timerMinutes: this.minutes.value,
      timerSeconds: this.seconds.value,
      breakMinutes: this.breakMinutes.value,
      breakSeconds: this.breakSeconds.value,
      autostartAfterBreak: this.autostartAfterBreak.value,
      allowOverride: this.allowOverride.value
    }
    this.bottomSheetRef.dismiss(result)
  }

  cancel() {
    this.bottomSheetRef.dismiss();
  }
}
