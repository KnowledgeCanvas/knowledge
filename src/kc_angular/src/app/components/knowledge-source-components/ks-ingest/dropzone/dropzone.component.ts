import {Component, Input, OnInit} from '@angular/core';
import {animate, state, style, transition, trigger} from "@angular/animations";

@Component({
  selector: 'app-dropzone',
  templateUrl: './dropzone.component.html',
  styleUrls: ['./dropzone.component.scss'],
  animations: [
    trigger('dropzone-shorten', [
      state('dropzone-lg',
        style({height: '35vh', top: 0, left: 0})
      ),
      state('dropzone-sm',
        style({height: '10vh', top: 0, left: 0})
      ),
      transition('dropzone-lg => dropzone-sm', [
        animate('0.1s')
      ]),
      transition('dropzone-sm => dropzone-lg', [
        animate('0.1s')
      ])
    ])
  ]
})
export class DropzoneComponent implements OnInit {
  @Input() shouldShorten: boolean = false;
  @Input() supportedTypes: string[] = [];
  constructor() {
  }
  ngOnInit(): void {
  }
}
