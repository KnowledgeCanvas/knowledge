import {Component, OnInit} from '@angular/core';
import {Location} from '@angular/common'

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  localStorage: boolean = window.localStorage.length > 0;

  constructor(private location: Location) {
  }

  ngOnInit(): void {
  }

  clearLocalStorage() {
    window.localStorage.clear();
    this.localStorage = false;
  }

  back() {
    this.location.back();
  }
}
