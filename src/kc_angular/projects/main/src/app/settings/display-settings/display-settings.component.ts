import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-display-settings',
  templateUrl: './display-settings.component.html',
  styleUrls: ['./display-settings.component.scss']
})
export class DisplaySettingsComponent implements OnInit {
  fontSize = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24];

  constructor() {
  }

  ngOnInit(): void {
  }

  setFontSize(size: number) {
    let all = document.querySelectorAll('.kc-font-changeable');
    all.forEach((value, key, parent) => {
      value.setAttribute('style', `font-size:${size}px;`);
    });
  }

}
