import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'ks-lib-page-header-large',
  templateUrl: './page-header-large.component.html',
  styleUrls: ['./page-header-large.component.css']
})
export class PageHeaderLargeComponent implements OnInit {
  @Input() text: string = '';

  constructor() { }

  ngOnInit(): void {
  }

}
