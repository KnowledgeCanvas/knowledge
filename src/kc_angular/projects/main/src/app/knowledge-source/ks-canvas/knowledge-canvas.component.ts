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

import {Component, OnInit} from '@angular/core';
import {ProjectModel} from "projects/ks-lib/src/lib/models/project.model";
import {KsQueueService} from "../ks-queue-service/ks-queue.service";

@Component({
  selector: 'app-canvas',
  templateUrl: './knowledge-canvas.component.html',
  styleUrls: ['./knowledge-canvas.component.scss']
})
export class KnowledgeCanvasComponent implements OnInit {
  project: ProjectModel | null = null;
  searchBarVisible: boolean = false;

  constructor(private ksQueueService: KsQueueService) {
    ksQueueService.ksQueue.subscribe((ksList) => {
      // Used to set the height of knowledge-canvas-container, because otherwise the project details become hidden underneath the footer (would be nice not to have to do this!)
      this.searchBarVisible = ksList.length > 0;
    })
  }

  ngOnInit(): void {
  }
}
