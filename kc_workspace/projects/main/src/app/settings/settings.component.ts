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

  printLocalStorage() {
    let ksList = window.localStorage.getItem('kc-knowledge-sources');
    if (ksList) {
      let ksParsed = JSON.parse(ksList);
    }

    let projects = window.localStorage.getItem('kc-projects');
    if (projects) {
      let projectsParsed = JSON.parse(projects);
    }
  }

  back() {
    this.location.back();
  }
}
