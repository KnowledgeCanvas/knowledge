import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common'

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  localStorage: boolean = window.localStorage.length > 0;

  constructor(private location: Location) { }

  ngOnInit(): void {
  }

  clearLocalStorage() {
    console.log('Clearing localStorage...');
    window.localStorage.clear();
    this.localStorage = false;
  }

  printLocalStorage() {
    for (let i = 0; i < window.localStorage.length; i++) {
      console.log(`localStorage entry ${i+1}: `, window.localStorage.getItem(`${i}`));
    }
  }

  back() {
    this.location.back();
  }
}
