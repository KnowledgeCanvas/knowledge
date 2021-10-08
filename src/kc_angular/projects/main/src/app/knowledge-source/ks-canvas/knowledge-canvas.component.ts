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


import {Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges} from '@angular/core';
import {ProjectModel, ProjectUpdateRequest} from "projects/ks-lib/src/lib/models/project.model";
import {KnowledgeSource} from "../../../../../ks-lib/src/lib/models/knowledge.source.model";
import {KsDropService} from "../../../../../ks-lib/src/lib/services/ks-drop/ks-drop.service";
import {KsInfoDialogService} from "../../../../../ks-lib/src/lib/services/ks-info-dialog.service";
import {KcDialogRequest, KcDialogService} from "../../../../../ks-lib/src/lib/services/dialog/kc-dialog.service";
import {ProjectService} from "../../../../../ks-lib/src/lib/services/projects/project.service";
import {BrowserViewDialogService} from "../../../../../ks-lib/src/lib/services/browser-view-dialog/browser-view-dialog.service";
import {ElectronIpcService} from "../../../../../ks-lib/src/lib/services/electron-ipc/electron-ipc.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Clipboard} from "@angular/cdk/clipboard";

@Component({
  selector: 'app-canvas',
  templateUrl: './knowledge-canvas.component.html',
  styleUrls: ['./knowledge-canvas.component.scss']
})
export class KnowledgeCanvasComponent implements OnInit, OnDestroy, OnChanges {
  @Input() kcProject!: ProjectModel;
  @Input() searchBarVisible: boolean = false;
  @Output() ksRemoved = new EventEmitter<KnowledgeSource>();
  @Output() ksAdded = new EventEmitter<KnowledgeSource[]>();
  @Output() projectChanged = new EventEmitter<ProjectModel>();
  projectKsList: KnowledgeSource[] = [];
  projectKsListId = 'projectKsList';

  constructor(private ksDropService: KsDropService,
              private ksInfoDialog: KsInfoDialogService,
              private projectService: ProjectService,
              private ksInfoDialogService: KsInfoDialogService,
              private browserViewDialogService: BrowserViewDialogService,
              private dialogService: KcDialogService,
              private ipcService: ElectronIpcService,
              private snackbar: MatSnackBar,
              private clipboard: Clipboard) {
    ksDropService.register({
      containerId: this.projectKsListId,
      receiveFrom: ['ksQueue'],
      sendTo: [],
      allowSort: true
    })
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.kcProject) {
      this.projectKsList = changes.kcProject.currentValue.knowledgeSource;
    }
  }

  ngOnDestroy() {
    this.ksDropService.unregister(this.projectKsListId);
  }

  projectKsSelected($event: KnowledgeSource) {
    this.ksInfoDialog.open($event, this.kcProject?.id.value).then((ksInfoOutput) => {
    })
  }

  ksListChanged(ksList: KnowledgeSource[]) {
    if (this.kcProject) {
      this.projectKsList = ksList;
      this.kcProject.knowledgeSource = ksList;
      this.projectChanged.emit(this.kcProject);
    } else {
      this.projectKsList = [];
    }
  }

  ksListSorted(ksList: KnowledgeSource[]) {
    // TODO: do we want to take action when the list is sorted?
  }

  ksRemovedFromProject($event: KnowledgeSource) {
    // TODO: do we want to take action when a KS is removed?
  }

  ksShow(ks: KnowledgeSource) {
    if (typeof ks.accessLink !== "string") {
      return;
    }
    this.ipcService.showItemInFolder(ks.accessLink);
  }

  ksRemove(ks: KnowledgeSource) {
    let associatedProject: ProjectModel | undefined;

    if (!ks.associatedProjects) {
      console.error('Attempting to delete knowledge source with no associated project...');
      return;
    }

    associatedProject = this.projectService.getProject(ks.associatedProjects[0].value);

    if (!associatedProject) {
      console.error('Attempting to delete knowledge source with no associated project...');
      return;
    }

    let confirmDialogConfig: KcDialogRequest = {
      actionButtonText: "Delete Permanently",
      actionToTake: 'delete',
      cancelButtonText: "Cancel",
      listToDisplay: [ks],
      message: `Are you sure you want to delete this Knowledge Source from "${associatedProject.name}"?`,
      title: `Delete`
    }

    this.dialogService.open(confirmDialogConfig);
    this.dialogService.confirmed().subscribe((confirmed) => {
      if (confirmed && associatedProject) {
        let update: ProjectUpdateRequest = {
          id: associatedProject.id,
          removeKnowledgeSource: [ks]
        }
        this.projectService.updateProject(update);
      }
    });
  }

  ksPreview(ks: KnowledgeSource) {
    const dialogRef = this.browserViewDialogService.open({ks: ks});

    dialogRef.componentInstance.output.subscribe((output) => {
      let ks = output.ks;
      this.ksAccessed(ks);
    });
  }

  ksOpen(ks: KnowledgeSource) {
    window.open(typeof ks.accessLink === 'string' ? ks.accessLink : ks.accessLink.href);
    this.ksAccessed(ks);
  }

  ksAccessed(ks: KnowledgeSource) {
    ks.dateAccessed = new Date();

    if (!ks.associatedProjects) {
      return;
    }
    let projectId = this.projectService.getProject(ks.associatedProjects[0].value);

    if (!projectId) {
      return;
    }

    let update: ProjectUpdateRequest = {
      id: projectId.id,
      updateKnowledgeSource: [ks]
    }

    this.projectService.updateProject(update);
  }

  ksEdit(ks: KnowledgeSource) {
    if (!ks.associatedProjects) {
      return;
    }

    let projectId = this.projectService.getProject(ks.associatedProjects[0].value);
    if (!projectId) {
      return;
    }

    this.ksInfoDialogService.open(ks, projectId.id.value).then((output) => {
      if (output.ksChanged && this.kcProject && projectId) {
        this.ksModified(output.ks);
      }
      if (output.preview) {
        this.ksPreview(output.ks);
      }
    })
  }

  ksCopy(ks: KnowledgeSource) {
    this.clipboard.copy(typeof ks.accessLink === 'string' ? ks.accessLink : ks.accessLink.href);
    this.snackbar.open('Copied to clipboard!', 'Dismiss', {duration: 2000, panelClass: 'kc-success'});
  }

  ksModified(ks: KnowledgeSource) {
    if (!ks.associatedProjects) {
      console.error('Knowledge Source has no associated project...');
      return;
    }

    let associatedProject = ks.associatedProjects[0].value;
    let project = this.projectService.getProject(associatedProject);
    if (!project) {
      console.error('Knowledge Source has no associated project...');
      return;
    }

    ks.dateModified = new Date();

    let update: ProjectUpdateRequest = {
      id: project.id,
      updateKnowledgeSource: [ks]
    }
    this.projectService.updateProject(update);
  }
}
