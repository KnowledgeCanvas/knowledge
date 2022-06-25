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
import {KnowledgeSource} from "../../models/knowledge.source.model";

@Component({
  selector: 'app-ks-icon',
  template: `
    <img [src]="ks.icon"
         class="knowledge-source-icon"
         [class.shadow-3]="showShadow"
         [class.bg-auto]="autoBackgroundColor"
         width="24"
         alt="Knowledge Source Icon">
  `,
  styles: []
})
export class KsIconComponent implements OnInit {
  @Input() ks!: KnowledgeSource;

  @Input() showEditor: boolean = true;

  @Input() showShadow: boolean = true;

  @Input() autoBackgroundColor: boolean = true;

  constructor() { }

  ngOnInit(): void {
  }

}
