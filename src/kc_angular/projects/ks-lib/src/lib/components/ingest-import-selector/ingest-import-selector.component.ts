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

import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ProjectModel} from "projects/ks-lib/src/lib/models/project.model";
import {MatRadioChange} from "@angular/material/radio";

@Component({
  selector: 'ks-lib-ingest-import-selector',
  templateUrl: './ingest-import-selector.component.html',
  styleUrls: ['./ingest-import-selector.component.css']
})
export class IngestImportSelectorComponent implements OnInit {
  destination: 'project' | 'queue' = 'project';
  @Input() currentProject: ProjectModel | undefined = undefined;
  @Output() selection = new EventEmitter<'project' | 'queue'>();

  constructor() {
  }

  ngOnInit(): void {
    this.selection.emit('project');
  }

  setDestination(change: MatRadioChange) {
    this.selection.emit(change.value);
  }
}
