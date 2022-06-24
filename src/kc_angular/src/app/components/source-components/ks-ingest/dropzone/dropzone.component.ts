/**
 Copyright 2022 Rob Royce

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
import {Component, Input, OnInit} from '@angular/core';
import {animate, state, style, transition, trigger} from "@angular/animations";

@Component({
  selector: 'app-dropzone',
  templateUrl: './dropzone.component.html',
  styleUrls: ['./dropzone.component.scss'],
  animations: [
    trigger('dropzone-shorten', [
      state('dropzone-lg',
        style({height: '20vh', top: 0, left: 0})
      ),
      state('dropzone-sm',
        style({height: '4rem', top: 0, left: 0})
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

  @Input() emptyMessage: string = 'Drag links, files, and more here!';

  @Input() hintMessage: string = 'Hint: You can drag files and links directly into this window.';

  constructor() {
  }
  ngOnInit(): void {
  }
}
