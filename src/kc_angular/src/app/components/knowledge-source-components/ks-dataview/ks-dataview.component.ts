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
import {KnowledgeSource} from "../../../models/knowledge.source.model";
import {KsCommandService} from "../../../services/command-services/ks-command.service";

@Component({
  selector: 'app-ks-dataview',
  templateUrl: './ks-dataview.component.html',
  styleUrls: ['./ks-dataview.component.scss']
})
export class KsDataviewComponent implements OnInit {
  @Input() ksList!: KnowledgeSource[];

  constructor(private ksCommandService: KsCommandService) { }

  ngOnInit(): void {
  }

  onKsRemove($event: KnowledgeSource) {
    this.ksCommandService.remove([$event]);
  }

  onKsOpen($event: KnowledgeSource) {
    this.ksCommandService.open($event);
  }

  onKsPreview($event: KnowledgeSource) {
    this.ksCommandService.preview($event);
  }

  onKsDetail($event: KnowledgeSource) {
    this.ksCommandService.detail($event);
  }
}
