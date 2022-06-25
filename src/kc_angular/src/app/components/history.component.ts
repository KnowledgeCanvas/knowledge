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
import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {NavigationEnd, Router} from "@angular/router";
import {Location} from "@angular/common";

@Component({
  selector: 'app-history',
  template: `
    <button pButton icon="pi pi-arrow-left" class="p-button-text outline-none" (click)="onBack($event)"></button>
    <button pButton icon="pi pi-arrow-right" class="p-button-text outline-none" (click)="onForward($event)"></button>
    <button pButton icon="pi pi-clock" class="p-button-text outline-none" (click)="onHistory($event)"></button>
  `,
  styles: [
    `
    `
  ]
})
export class HistoryComponent implements OnInit {
  constructor(private router: Router, private location: Location) {

  }

  ngOnInit(): void {
  }

  onBack($event: MouseEvent) {
    // TODO: make sure this is a valid operation before doing it
    // TODO: check if the project has changed.. going back should also change the project back to what it was before
    this.location.back();
  }

  onForward($event: MouseEvent) {
    this.location.forward();
  }

  onHistory($event: MouseEvent) {
    console.log('Not implemented yet...');
  }
}
