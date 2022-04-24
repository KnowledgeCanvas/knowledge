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


import {Component, ElementRef, EventEmitter, HostListener, OnInit, Output, ViewChild} from '@angular/core';
import {ProjectService} from "../../../services/factory-services/project-service/project.service";
import {ProjectModel} from "src/app/models/project.model";
import {KnowledgeSource} from "../../../models/knowledge.source.model";
import {FaviconExtractorService} from "../../../services/ingest-services/favicon-extraction-service/favicon-extractor.service";
import {SettingsService} from "../../../services/ipc-services/settings-service/settings.service";
import {MenuItem} from "primeng/api";
import {OverlayPanel} from "primeng/overlaypanel";
import {UuidModel} from "../../../models/uuid.model";
import {KsCommandService} from "../../../services/command-services/ks-command/ks-command.service";
import {KcCardRequest} from "../project-calendar/project-calendar.component";


@Component({
  selector: 'kc-project-overview',
  templateUrl: './project-details-overview.component.html',
  styleUrls: ['./project-details-overview.component.scss']
})
export class ProjectDetailsOverviewComponent implements OnInit {
  @ViewChild('projectOverview', {static: true}) container!: ElementRef;

  @ViewChild('projectInfoOverlay') projectInfoOverlay!: OverlayPanel;

  @ViewChild('ksOverlay') ksOverlay!: OverlayPanel;

  @ViewChild('projectOverlay') projectOverlay!: OverlayPanel;

  kcProject: ProjectModel | null = null;

  @Output() kcSetCurrentProject = new EventEmitter<string>();

  @Output() kcEditProject = new EventEmitter<UuidModel>();

  @Output() onProjectCreation = new EventEmitter<UuidModel | undefined>();

  @Output() onProjectRemove = new EventEmitter<UuidModel>();

  @Output() onTopicSearch = new EventEmitter<string>();

  showSubProjects: boolean = true;

  ksList: KnowledgeSource[] = [];

  breadcrumbs: MenuItem[] = [];

  breadcrumbHeader: MenuItem = {icon: 'pi pi-list', disabled: false}

  projectContext: any;

  selectedKs!: KnowledgeSource;

  selectedProject!: ProjectModel;

  viewIndex: number = 0;

  calendarIndex: number = 2;

  constructor(private projectService: ProjectService, private faviconService: FaviconExtractorService,
              private settingsService: SettingsService, private ksCommandService: KsCommandService) {
    projectService.currentProject.subscribe((kcProject) => {
      if (!kcProject) {
        return;
      }
      this.kcProject = kcProject;
      this.generateKsList(this.showSubProjects);
      this.setupBreadcrumbs(kcProject.id);
    })
    settingsService.app.subscribe((settings) => {
      this.showSubProjects = settings.ks?.table?.showSubProjects ?? false;
      this.generateKsList(this.showSubProjects);
    });
  }

  @HostListener('document:keydown.meta.1')
  changeTab1() {
    this.viewIndex = 0;
    this.onViewChange(this.viewIndex);
  }

  @HostListener('document:keydown.meta.2')
  changeTab2() {
    this.viewIndex = 1;
    this.onViewChange(this.viewIndex);
  }

  @HostListener('document:keydown.meta.3')
  changeTab3() {
    this.viewIndex = 2;
    this.onViewChange(this.viewIndex);
  }

  ngOnInit(): void {
    let idx = localStorage.getItem('project-view-index');
    if (idx) {
      this.viewIndex = Number(idx);
    }
  }

  setupBreadcrumbs(id: UuidModel) {
    let ancestors = this.projectService.getAncestors(id.value);
    this.breadcrumbs = [];
    for (let ancestor of ancestors) {
      this.breadcrumbs.push({
        label: ancestor.title, id: ancestor.id, title: ancestor.title,
        items: [{label: ancestor.title, id: ancestor.id, title: ancestor.title,}]
      });
    }
  }

  /**
   * Set current Knowledge Source list, making sure icons are visible in the process
   * @param ksList: A list of Knowledge Sources to be displayed in the KsTable
   */
  changeKsList(ksList: KnowledgeSource[]) {
    this.faviconService.extractFromKsList(ksList).then((list) => {
      this.ksList = list;
    })
  }

  /**
   * Toggles the inclusion of subproject knowledge sources in the KsList
   * @param show
   */
  generateKsList(show: boolean) {
    if (show) {
      let ksList: KnowledgeSource[] = [];

      if (this.kcProject?.knowledgeSource) {
        ksList = [...ksList, ...this.kcProject.knowledgeSource];

        const subTrees = this.projectService.getSubTree(this.kcProject.id.value);
        for (let subTree of subTrees) {

          // Ignore current project...
          if (subTree.id === this.kcProject.id.value) {
            continue;
          }

          let subProject = this.projectService.getProject(subTree.id);

          if (subProject && subProject.knowledgeSource) {
            ksList = [...ksList, ...subProject.knowledgeSource];
          }
        }

        this.showSubProjects = true;
        this.changeKsList(ksList);
      }

    } else {
      this.changeKsList(this.kcProject?.knowledgeSource ? this.kcProject.knowledgeSource : []);
      this.showSubProjects = false;
    }
  }

  navigate(id: UuidModel) {
    if (id.value !== this.kcProject?.id.value) {
      this.projectService.projectCommandNavigate(id.value);
    }
    this.projectInfoOverlay.hide();
  }

  addSubproject(id: UuidModel) {
    this.onProjectCreation.emit(id);
    this.projectInfoOverlay.hide();
  }

  onBreadcrumbClick($event: any) {
    // Project context will contain the project associated with breadcrumb ID
    this.projectContext = this.projectService.getProject($event.item.id);

    // Toggle the overlay using the original event to guarantee correct positioning
    this.projectInfoOverlay.toggle($event.originalEvent);
  }

  topicsOnChange($event: any) {
    if (!this.kcProject) {
      console.warn('A topic was changed but no current project exists.')
      return;
    }

    if ($event.value && typeof $event.value === 'string') {
      this.projectService.updateProjects([{
        id: this.kcProject.id
      }]);
    }
  }

  topicsOnClick($event: any) {
    if (typeof $event === 'string') {
      this.onTopicSearch.emit($event);
    } else if ($event.value && typeof $event.value === 'string') {
      this.onTopicSearch.emit($event.value);
    }
  }

  onArchiveProject(_: UuidModel) {
    // TODO: develop archival process (long-term storage and ability to retrieve later must be supported)
  }

  onRemoveProject($event: UuidModel) {
    this.onProjectRemove.emit($event);
  }

  onKsPreview($event: KnowledgeSource) {
    this.ksCommandService.preview($event);
  }

  onKsOpen($event: KnowledgeSource) {
    this.ksCommandService.open($event);
  }

  onKsDetail($event: KnowledgeSource) {
    this.ksCommandService.detail($event);
  }

  onProjectCard(req: KcCardRequest) {
    this.ksOverlay.hide();

    if (!req.projectId) {
      return;
    }

    const selected = this.projectService.getProject(req.projectId);
    if (selected) {
      this.selectedProject = selected;
      this.projectOverlay.toggle(req.event, req.element);
    }
  }

  onKsCard(req: KcCardRequest) {
    this.projectOverlay.hide();

    if (!req.ksId) {
      return;
    }

    const selected = this.ksList.find(k => k.id.value === req.ksId?.value);
    if (selected) {
      this.selectedKs = selected;
      this.ksOverlay.toggle(req.event, req.element);
    }
  }

  onViewChange(index: number) {
    if (index === this.calendarIndex) {
      return;
    }
    localStorage.setItem('project-view-index', JSON.stringify(index));
  }
}
