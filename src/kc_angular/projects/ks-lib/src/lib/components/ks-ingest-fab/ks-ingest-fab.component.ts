/**
 Copyright 2021 Rob Royce

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

import {Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild} from '@angular/core';

@Component({
  selector: 'ks-lib-ks-ingest-fab',
  templateUrl: './ks-ingest-fab.component.html',
  styleUrls: ['./ks-ingest-fab.component.scss']
})
export class KsIngestFabComponent implements OnInit {
  hovering: boolean = false;
  expanded: boolean = false;
  @Input() kcProjectId?: string;
  @Input() ksFabAnimate: boolean = true;
  @Input() ksFabActions: { icon: string, label: string, click: () => void }[] = [];
  @Input() ksFabExpandOnHover: boolean = true;
  @Output() ksFabExpanded = new EventEmitter<boolean>();
  @Output() ksFabHovering = new EventEmitter<boolean>();
  @ViewChild('ksFabHover') private ksFabHover!: ElementRef;
  @ViewChild('ksFabButton') private ksFabButton!: ElementRef;

  constructor() {
  }

  @HostListener('mouseenter') onMouseEnter() {
    this.hovering = true;
    this.ksFabHovering.emit(this.hovering);
    if (this.ksFabExpandOnHover) {
      this.expanded = true;
      this.ksFabExpanded.emit(true);
    }
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.hovering = false;
    this.ksFabHovering.emit(this.hovering);
    setTimeout(() => {
      this.expanded = false;
      this.ksFabExpanded.emit(false);
    }, 250);
  }

  ngOnInit(): void {
  }

  fabClicked() {
    if (!this.ksFabExpandOnHover) {
      this.expanded = true;
      this.ksFabExpanded.emit(true);
    }
  }
}
