import {Component} from '@angular/core';
import {MatDialog} from "@angular/material/dialog";
import {DigitalWellnessComponent} from "../../../ks-lib/src/lib/components/digital-wellness/digital-wellness.component";
import {MatBottomSheet} from "@angular/material/bottom-sheet";
import {DigitalWellnessSettingsComponent} from "../../../ks-lib/src/lib/components/digital-wellness-settings/digital-wellness-settings.component";
import {Router} from "@angular/router";
import {SettingsService} from "../../../ks-lib/src/lib/services/settings/settings.service";
import {WellnessSettingsModel} from "../../../ks-lib/src/lib/models/settings.model";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  notRunningTooltip = 'Click the button to start your timer. Knowledge Canvas will let you know when it\'s time for' +
    ' a break!';
  runningTooltip = 'Click the button to pause your timer';
  timerRunning: boolean = false;
  title = 'Knowledge Canvas';
  breaking: boolean = false;
  breakTimer = '15m 00s'
  timerReady = false;
  timer = '15m 00s'
  interval: any;
  private timerMinutes = 25;
  private timerSeconds = 0;
  private breakMinutes = 5;
  private breakSeconds = 0;
  private autostartAfterBreak = false;
  private allowOverride = false;

  private timerMinutesLeft: number = this.timerMinutes;
  private timerSecondsLeft: number = this.timerSeconds;
  private breakMinutesLeft: number = this.breakMinutes;
  private breakSecondsLeft: number = this.breakSeconds;

  constructor(
    private dialog: MatDialog, private router: Router,
    private settingsService: SettingsService,
    private bottomSheet: MatBottomSheet,
  ) {
    this.settingsService.settings.subscribe((settings) => {
      if (settings && settings.wellness) {
        this.timerMinutes = settings.wellness.timerMinutes;
        this.timerSeconds = settings.wellness.timerSeconds;
        this.breakMinutes = settings.wellness.breakMinutes;
        this.breakSeconds = settings.wellness.breakSeconds;
        this.allowOverride = settings.wellness.allowOverride;
        this.autostartAfterBreak = settings.wellness.autostartAfterBreak;
        this.resetTimerValues();
        this.setTimer();
      }
    });
  }

  setTimer() {
    let min = `${this.timerMinutesLeft}`.padStart(2, '0');
    let sec = `${this.timerSecondsLeft}`.padStart(2, '0');
    this.timer = `${min}m ${sec}s`;
    this.timerReady = true;
  }

  setBreakTimer() {
    let min = `${this.breakMinutesLeft}`.padStart(2, '0');
    let sec = `${this.breakSecondsLeft}`.padStart(2, '0');
    this.breakTimer = `${min}m ${sec}s`;
  }

  restartTimer() {
    this.timerRunning = false;
    this.timerMinutesLeft = this.timerMinutes;
    this.timerSecondsLeft = this.timerSeconds;
    this.setTimer();
  }

  setTimerClicked() {
    let data: WellnessSettingsModel = {
      allowOverride: false,
      autostartAfterBreak: false,
      timerMinutes: this.timerMinutes,
      timerSeconds: this.timerSeconds,
      breakMinutes: this.breakMinutes,
      breakSeconds: this.breakSeconds
    }
    let options = {data: data}
    let bottomSheetRef = this.bottomSheet.open(DigitalWellnessSettingsComponent, options);
    bottomSheetRef.afterDismissed().subscribe((result) => {
      if (result === undefined) {
        return;
      }
      let wellnessUpdate: WellnessSettingsModel = {
        timerMinutes: result.timerMinutes as number,
        timerSeconds: result.timerSeconds as number,
        breakMinutes: result.breakMinutes as number,
        breakSeconds: result.breakSeconds as number,
        autostartAfterBreak: result.autostartAfterBreak,
        allowOverride: result.allowOverride
      }


      this.settingsService.saveSettings({wellness: wellnessUpdate});

      this.restartTimer();

      this.timerRunning = false;

      this.breaking = false;
    });
  }

  countDown(): boolean {
    if (this.breaking) {
      if (this.breakMinutesLeft == 0 && this.breakSecondsLeft == 0) {
        this.restartTimer();
        clearInterval(this.interval);
        this.timerRunning = false;
        this.breaking = false;
        return false;
      } else {
        this.breakMinutesLeft = this.breakSecondsLeft == 0 ? this.breakMinutesLeft - 1 : this.breakMinutesLeft;
        this.breakSecondsLeft = this.breakSecondsLeft == 0 ? 59 : this.breakSecondsLeft - 1;
        this.setBreakTimer();
        return true;
      }
    } else {
      if (this.timerMinutesLeft == 0 && this.timerSecondsLeft == 0) {
        this.restartTimer();
        clearInterval(this.interval);
        this.displayDigitalWellness();
        return false;
      } else {
        this.timerMinutesLeft = this.timerSecondsLeft == 0 ? this.timerMinutesLeft - 1 : this.timerMinutesLeft;
        this.timerSecondsLeft = this.timerSecondsLeft == 0 ? 59 : this.timerSecondsLeft - 1;
        this.setTimer()
        return true;
      }
    }

  }

  startTimer() {
    this.timerRunning = true;
    this.interval = setInterval(() => {
      this.countDown();
    }, 1000);
  }

  pauseTimer() {
    this.timerRunning = false;
    clearInterval(this.interval);
  }

  homeClicked() {
    this.router.navigate(['/app-projects']);
  }

  topLogoClicked() {
    // TODO: eventually this should take the user to the KC app website
  }

  resetTimerValues() {
    this.timerMinutesLeft = this.timerMinutes;
    this.timerSecondsLeft = this.timerSeconds;
    this.breakMinutesLeft = this.breakMinutes;
    this.breakSecondsLeft = this.breakSeconds;
  }

  private displayDigitalWellness() {
    this.resetTimerValues();
    this.setTimer();
    this.setBreakTimer();

    let options = {
      backdropClass: 'digital-wellness-backdrop',
      disableClose: true
    };

    const dialogRef = this.dialog.open(DigitalWellnessComponent, options);

    let instance = dialogRef.componentInstance;

    instance.timeRemaining = this.breakTimer;

    this.breaking = true;
    this.timerRunning = true;

    this.interval = setInterval(() => {
      if (this.timerRunning && this.countDown()) {
        instance.timeRemaining = this.breakTimer;
      } else {
        dialogRef.close();
      }
    }, 1000);
  }
}
