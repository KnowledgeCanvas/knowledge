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

import {Component, ElementRef, EventEmitter, OnChanges, OnInit, Output, SimpleChanges, ViewChild} from '@angular/core';
import {ProjectIdentifiers, ProjectService} from "../../../../../ks-lib/src/lib/services/projects/project.service";
import {ProjectModel} from "projects/ks-lib/src/lib/models/project.model";
import {MatAccordion} from "@angular/material/expansion";
import {KcCalendar} from "../../../../../ks-lib/src/lib/models/calendar.model";
import {ProjectTopicListComponent} from "../project-topic-list/project-topic-list.component";
import {KnowledgeSource} from "../../../../../ks-lib/src/lib/models/knowledge.source.model";
import {FaviconExtractorService} from "../../../../../ks-lib/src/lib/services/favicon/favicon-extractor.service";
import {MatSlideToggleChange} from "@angular/material/slide-toggle";
import {StorageService} from "../../../../../ks-lib/src/lib/services/storage/storage.service";
import {ElectronIpcService} from "../../../../../ks-lib/src/lib/services/electron-ipc/electron-ipc.service";
import {KcDialogRequest} from "kc_electron/src/app/models/electron.ipc.model";
import {SettingsService} from "../../../../../ks-lib/src/lib/services/settings/settings.service";

@Component({
  selector: 'kc-project-overview',
  templateUrl: './project-details-overview.component.html',
  styleUrls: ['./project-details-overview.component.scss']
})
export class ProjectDetailsOverviewComponent implements OnInit, OnChanges {
  @ViewChild('projectOverview', {static: true})
  container!: ElementRef;

  @ViewChild('accordion', {static: true})
  Accordion!: MatAccordion

  @ViewChild('topics', {static: true})
  topics!: ProjectTopicListComponent;

  kcProject!: ProjectModel;

  @Output()
  ksMenuCopyLinkClicked = new EventEmitter<KnowledgeSource>();

  @Output()
  ksMenuEditClicked = new EventEmitter<KnowledgeSource>();

  @Output()
  ksMenuOpenClicked = new EventEmitter<KnowledgeSource>();

  @Output()
  ksMenuPreviewClicked = new EventEmitter<KnowledgeSource>();

  @Output()
  ksMenuRemoveClicked = new EventEmitter<KnowledgeSource>();

  @Output()
  ksMenuShowFileClicked = new EventEmitter<KnowledgeSource>();

  @Output()
  kcSetCurrentProject = new EventEmitter<string>();

  @Output()
  ksModified = new EventEmitter<KnowledgeSource>();

  showSubProjects: boolean = false;

  ksList: KnowledgeSource[] = [];

  ancestors: ProjectIdentifiers[] = [];

  tooManyAncestorsToDisplay: boolean = false;
  clickExpandRows: boolean = true;

  constructor(private projectService: ProjectService,
              private faviconService: FaviconExtractorService,
              private settingsService: SettingsService,
              private storageService: StorageService,
              private ipcService: ElectronIpcService) {
    projectService.currentProject.subscribe((project) => {
      this.kcProject = project;

      this.ksTableSubprojectsToggled(this.showSubProjects);

      if (!project.calendar)
        project.calendar = new KcCalendar();

      // Show up to 3 breadcrumbs (including current project)
      let ancestors = this.projectService.getAncestors(project.id.value);

      if (ancestors.length > 3) {
        this.ancestors = ancestors.slice(ancestors.length - 3);
        this.tooManyAncestorsToDisplay = true;
      } else {
        this.ancestors = ancestors;
        this.tooManyAncestorsToDisplay = false;
      }
    });

    settingsService.appSettings.subscribe((settings) => {
      this.clickExpandRows = settings.ks?.table?.expandRows ?? true;
      this.showSubProjects = settings.ks?.table?.showSubProjects ?? false;
      console.log('Received settings for showSubProjects: ', settings);
      this.ksTableSubprojectsToggled(this.showSubProjects);
    });
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {
  }

  setDescription() {
    this.projectService.updateProject({id: this.kcProject.id});
  }

  openAll() {
    this.Accordion?.openAll();
  }

  closeAll() {
    this.Accordion?.closeAll();
  }

  setNotes() {
    this.projectService.updateProject({id: this.kcProject.id});
  }

  calStart($event: any) {
    if (this.kcProject.calendar) {
      this.kcProject.calendar.start = $event;
    } else {
      this.kcProject.calendar = new KcCalendar();
      this.kcProject.calendar.start = $event;
    }

    this.projectService.updateProject({id: this.kcProject.id});
  }

  calEnd($event: any) {
    if (this.kcProject.calendar) {
      this.kcProject.calendar.end = $event;
    } else {
      this.kcProject.calendar = new KcCalendar();
      this.kcProject.calendar.end = $event;
    }
    this.projectService.updateProject({id: this.kcProject.id});
  }

  navigate(id: string) {
    if (id !== this.kcProject.id.value)
      this.projectService.setCurrentProject(id);
  }

  async changeKsList(ksList: KnowledgeSource[]) {
    await this.faviconService.extractFromKsList(ksList).then((list) => {
      this.ksList = [...list];
    })
  }

  async ksTableSubprojectsToggled(show: boolean) {
    if (show) {
      let ksList: KnowledgeSource[] = [];

      if (this.kcProject.knowledgeSource)
        ksList = [...ksList, ...this.kcProject.knowledgeSource];

      const subTrees = this.projectService.getSubTree(this.kcProject.id.value);
      for (let subTree of subTrees) {
        // Ignore current project...
        if (subTree.id === this.kcProject.id.value)
          continue;

        let subProject = this.projectService.getProject(subTree.id);

        if (subProject && subProject.knowledgeSource)
          ksList = [...ksList, ...subProject.knowledgeSource];
      }

      this.showSubProjects = true;
      this.changeKsList(ksList);
    } else {
      this.changeKsList(this.kcProject.knowledgeSource ? this.kcProject.knowledgeSource : []);
      this.showSubProjects = false;
    }
  }

  onShowSubProjectsClicked(toggle: MatSlideToggleChange) {
    this.ksTableSubprojectsToggled(toggle.checked);
    this.settingsService.saveSettings({app: {ks: {table: {showSubProjects: toggle.checked, expandRows: this.clickExpandRows}}}});
  }

  removeClicked($event: KnowledgeSource) {
    this.ksMenuRemoveClicked.emit($event);
  }

  onExportClicked($event: MouseEvent) {
    this.storageService.export();
  }

  displayKnowledgeGraph() {
    console.log('Knowledge graph for project: ', this.kcProject);
    if (!this.kcProject.knowledgeSource)
      return;
    const request: KcDialogRequest = {
      ksList: this.kcProject.knowledgeSource
    }
    this.ipcService.openKcDialog(request).then(() => {
      console.log('Kc Dialog opened...');
    })
  }

  onExpandRowsClicked($event: MatSlideToggleChange) {
    this.settingsService.saveSettings({app: {ks: {table: {expandRows: $event.checked, showSubProjects: this.showSubProjects}}}});
  }
}
