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

import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {ProjectModel} from "projects/ks-lib/src/lib/models/project.model";
import {KsQueueService} from "../ks-queue-service/ks-queue.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {ProjectService} from "../../../../../ks-lib/src/lib/services/projects/project.service";
import {IngestType} from "projects/ks-lib/src/lib/models/knowledge.source.model";
import {KsFactoryService} from "../../../../../ks-lib/src/lib/services/ks-factory/ks-factory.service";
import {BrowserViewDialogService} from "../../../../../ks-lib/src/lib/services/browser-view-dialog/browser-view-dialog.service";


export interface KsImportDialogOutput {
  ingestType: IngestType
}

@Component({
  selector: 'app-canvas-import',
  templateUrl: './knowledge-source-import-dialog.component.html',
  styleUrls: ['./knowledge-source-import-dialog.component.scss']
})
export class KnowledgeSourceImportDialogComponent implements OnInit {
  ingestType: IngestType = 'generic';
  stage_1: boolean = true;
  stage_2: boolean = false;
  stage_3: boolean = false;
  extractionEnabled: boolean = false;
  filesEnabled: boolean = false;
  noteEnabled: boolean = false;
  currentProject: ProjectModel | undefined;

  constructor(private dialogRef: MatDialogRef<any>,
              private browserViewDialogService: BrowserViewDialogService,
              private ksFactory: KsFactoryService,
              @Inject(MAT_DIALOG_DATA) public data: ProjectModel,
              private ksQueueService: KsQueueService,
              private snackBar: MatSnackBar,
              private projectService: ProjectService) {
    this.currentProject = projectService.getProject(projectService.getCurrentProjectId().value);
  }

  ngOnInit(): void {
  }

  selectSearch() {
    this.ingestType = 'search';
    this.startTransition();
  }

  selectNote() {
    this.ingestType = 'note';
    this.startTransition();
  }

  selectExtract() {
    this.ingestType = 'website';
    this.startTransition();
  }

  selectTopics() {
    this.ingestType = 'topic';
    this.startTransition();
  }

  selectFiles() {
    this.ingestType = 'file';
    this.startTransition();
  }

  private startTransition() {
    this.stage_1 = false;
    this.resizeDialog();
  }

  private resizeDialog() {
    this.dialogRef.addPanelClass(['scale-out-center']);
    setTimeout(() => {
      this.stage_2 = true;
    }, 400);
    switch (this.ingestType) {
      case "note":
        setTimeout(() => {
          this.dialogRef.removePanelClass('scale-out-center');
          this.dialogRef.addPanelClass(['scale-up-center']);
          this.noteEnabled = true;
        }, 400);
        break;

      case "search":
        setTimeout(() => {
          this.dialogRef.removePanelClass('scale-out-center');
          this.dialogRef.addPanelClass(['scale-up-center']);
          this.noteEnabled = true;
        }, 400);

        let output: KsImportDialogOutput = {
          ingestType: 'search'
        }
        this.dialogRef.close(output);

        break;

      case "file":
        setTimeout(() => {
          this.dialogRef.removePanelClass('scale-out-center');
          this.dialogRef.addPanelClass(['scale-up-center']);
          this.filesEnabled = true;
        }, 400);
        break;

      case "website":
        setTimeout(() => {
          this.dialogRef.removePanelClass('scale-out-center');
          this.dialogRef.addPanelClass(['scale-up-center']);
          this.extractionEnabled = true;
        }, 400);
        break;

      case "topic":
        this.performTopicSearch();
        break;
    }
  }

  private performTopicSearch() {
    let projectId = this.projectService.getCurrentProjectId();
    let project = this.projectService.getProject(projectId.value);
    let message;

    if (!project?.topics || project.topics.length <= 0) {
      message = 'Add some topics first!';
      this.snackBar.open(message, 'Dismiss', {
        duration: 3000,
        verticalPosition: 'bottom',
        panelClass: ['kc-danger-zone-snackbar']
      });
      this.dialogRef.close();
      return;
    }

    let searchTerm = project.topics.join(' AND ');
    let ks = this.ksFactory.searchKS(searchTerm);
    this.browserViewDialogService.open({ks: ks});
    this.dialogRef.close();
  }
}
