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


import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {ProjectModel, ProjectUpdateRequest} from "projects/ks-lib/src/lib/models/project.model";
import {KnowledgeSource} from "../../../../../ks-lib/src/lib/models/knowledge.source.model";
import {KsDropService} from "../../../../../ks-lib/src/lib/services/ks-drop/ks-drop.service";
import {KsInfoDialogService} from "../../../../../ks-lib/src/lib/services/ks-info-dialog.service";
import {KcDialogService} from "../../../../../ks-lib/src/lib/services/dialog/kc-dialog.service";
import {ProjectService} from "../../../../../ks-lib/src/lib/services/projects/project.service";
import {BrowserViewDialogService} from "../../../../../ks-lib/src/lib/services/browser-view-dialog/browser-view-dialog.service";
import {ElectronIpcService} from "../../../../../ks-lib/src/lib/services/electron-ipc/electron-ipc.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Clipboard} from "@angular/cdk/clipboard";

@Component({
  selector: 'app-knowledge-canvas',
  templateUrl: './knowledge-canvas.component.html',
  styleUrls: ['./knowledge-canvas.component.scss']
})
export class KnowledgeCanvasComponent implements OnInit, OnDestroy {
  kcProject!: ProjectModel;

  @Input()
  ksQueueVisible: boolean = false;

  @Output()
  ksRemoved = new EventEmitter<KnowledgeSource>();

  @Output()
  ksAdded = new EventEmitter<KnowledgeSource[]>();

  @Output()
  kcProjectUpdate = new EventEmitter<ProjectModel>();

  @Output()
  kcSetCurrentProject = new EventEmitter<string>();

  projectKsListId = 'projectKsList';

  constructor(private ksDropService: KsDropService,
              private projectService: ProjectService,
              private ksInfoDialogService: KsInfoDialogService,
              private browserViewDialogService: BrowserViewDialogService,
              private dialogService: KcDialogService,
              private ipcService: ElectronIpcService,
              private snackbar: MatSnackBar,
              private clipboard: Clipboard) {
    projectService.currentProject.subscribe((project) => {
      this.kcProject = project;
    })
    ksDropService.register({
      containerId: this.projectKsListId,
      receiveFrom: ['ksQueue'],
      sendTo: [],
      allowSort: true
    })
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.ksDropService.unregister(this.projectKsListId);
  }

  projectKsSelected($event: KnowledgeSource) {
    this.ksInfoDialogService.open($event, this.kcProject?.id.value).then((ksInfoOutput) => {
      if (ksInfoOutput.ksChanged) {
        this.ksModified(ksInfoOutput.ks);
      }
    })
  }

  ksListChanged(ksList: KnowledgeSource[]) {
    if (this.kcProject) {
      for (let ks of ksList) {
        ks.associatedProjects = [this.kcProject.id];
      }
      this.kcProject.knowledgeSource = [...ksList];
      this.kcProjectUpdate.emit(this.kcProject);
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
      console.error('Attempting to delete knowledge source with no associated project...: ', ks);
      return;
    }

    associatedProject = this.projectService.getProject(ks.associatedProjects[0].value);

    if (!associatedProject) {
      console.error('Attempting to delete knowledge source with no associated project...', ks);
      return;
    }

    this.dialogService.openWarnDeleteKs(ks).then((confirmed) => {
      if (!this.kcProject || !confirmed || !associatedProject) {
        return;
      }
      const update: ProjectUpdateRequest = {
        id: associatedProject.id,
        removeKnowledgeSource: [ks]
      }
      this.projectService.updateProject(update);
    })
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
    ks.dateAccessed.push(new Date());
    this.ksAccessed(ks);
  }

  ksAccessed(ks: KnowledgeSource) {
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

    ks.dateModified.push(new Date());

    let update: ProjectUpdateRequest = {
      id: project.id,
      updateKnowledgeSource: [ks]
    }
    this.projectService.updateProject(update);
  }
}
