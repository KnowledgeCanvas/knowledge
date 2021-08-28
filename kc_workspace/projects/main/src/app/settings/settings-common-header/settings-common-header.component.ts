import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-settings-common-header',
  templateUrl: './settings-common-header.component.html',
  styleUrls: ['./settings-common-header.component.scss']
})
export class SettingsCommonHeaderComponent implements OnInit {
  @Input() header: string = '';

  constructor() { }

  ngOnInit(): void {
  }

}
