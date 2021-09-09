import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';

@Component({
  selector: 'ks-lib-digital-wellness',
  templateUrl: './digital-wellness.component.html',
  styleUrls: ['./digital-wellness.component.css']
})
export class DigitalWellnessComponent implements OnInit {
  @Input() timeRemaining = '';
  @Input() canClose: boolean = true;
  constructor() {}

  ngOnInit(): void {
  }
}
