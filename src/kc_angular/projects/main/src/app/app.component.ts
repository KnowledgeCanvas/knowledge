import { Component } from '@angular/core';
import {MatDialog} from "@angular/material/dialog";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Knowledge Canvas';

  constructor(private dialog: MatDialog) {
  }

  setTimerClicked() {
    // TODO: implement timer that blocks out the screen for the specified time period
    console.log('Timer dialog should pop up now...');
  }
}
