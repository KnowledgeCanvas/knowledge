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

import {Component, ElementRef, EventEmitter, OnChanges, OnInit, Output, SimpleChanges, ViewChild} from '@angular/core';
import {ProjectService} from "../../../services/factory-services/project-service/project.service";
import {ProjectModel} from "src/app/models/project.model";
import {KnowledgeSource} from "../../../models/knowledge.source.model";
import {FaviconExtractorService} from "../../../services/ingest-services/favicon-extraction-service/favicon-extractor.service";
import {SettingsService} from "../../../services/ipc-services/settings-service/settings.service";
import {MenuItem} from "primeng/api";
import {OverlayPanel} from "primeng/overlaypanel";
import {UuidModel} from "../../../models/uuid.model";
import {CalendarOptions, FullCalendarModule} from "@fullcalendar/angular";
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import {KsCommandService} from "../../../services/command-services/ks-command/ks-command.service";

FullCalendarModule.registerPlugins([
  dayGridPlugin,
  timeGridPlugin,
  listPlugin,
  interactionPlugin
]);

@Component({
  selector: 'kc-project-overview',
  templateUrl: './project-details-overview.component.html',
  styleUrls: ['./project-details-overview.component.scss']
})
export class ProjectDetailsOverviewComponent implements OnInit, OnChanges {
  @ViewChild('projectOverview', {static: true}) container!: ElementRef;

  @ViewChild('projectInfoOverlay') projectInfoOverlay!: OverlayPanel;

  @ViewChild('ksOverlay') ksOverlay!: OverlayPanel;

  @ViewChild('projectOverlay') projectOverlay!: OverlayPanel;

  @Output() kcSetCurrentProject = new EventEmitter<string>();

  @Output() kcEditProject = new EventEmitter<UuidModel>();

  @Output() onProjectCreation = new EventEmitter<UuidModel | undefined>();

  @Output() onProjectRemove = new EventEmitter<UuidModel>();

  @Output() onTopicSearch = new EventEmitter<string>();

  showSubProjects: boolean = true;

  kcProject: ProjectModel | null = null;

  ksList: KnowledgeSource[] = [];

  breadcrumbs: MenuItem[] = [];

  projectContext: any;
  selectedKs!: KnowledgeSource;
  calendarOptions: CalendarOptions = {
    initialView: 'listMonth',
    dateClick: (arg) => {
      console.log('Date clicked: ', arg);
    },
    eventClick: (arg) => {
      arg.jsEvent.preventDefault();
      console.log('Event clicked: ', arg);

      if (arg.event._def.url === 'project') {
        this.projectOverlay.toggle(arg.jsEvent, arg.el);
      } else {
        const found = this.ksList.find(k => k.id.value === arg.event._def.url);
        if (found) {
          this.selectedKs = found;
          this.ksOverlay.toggle(arg.jsEvent, arg.el);
        }
      }
    },
    moreLinkClick: (arg) => {
      console.log('More link clicked: ', arg);
    },
    events: [],
    editable: false,
    selectable: false,
    selectMirror: false,
    dayMaxEvents: true,
    nowIndicator: true,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'listMonth,timeGridWeek,timeGridDay,dayGridMonth'
    },
  };

  constructor(private projectService: ProjectService, private faviconService: FaviconExtractorService,
              private settingsService: SettingsService, private ksCommandService: KsCommandService) {
    projectService.currentProject.subscribe((project) => {

      this.kcProject = project;

      if (!project) {
        return;
      }

      this.generateKsList(this.showSubProjects);

      if (!project.calendar)
        project.calendar = {events: [], start: null, end: null};

      let events: {
        title: string,
        start: string | Date,
        end?: string | Date,
        color?: string,
        textColor?: string,
        url?: string
      }[] = [
        {
          title: `"${project.name}" (Created)`,
          start: project.dateCreated,
          color: 'yellow',
          textColor: 'black',
          url: 'project'
        },
        {
          title: `"${project.name}" (Modified)`,
          start: project.dateModified,
          color: 'yellow',
          textColor: 'black',
          url: 'project'
        },
        {
          title: `"${project.name}" (Accessed)`,
          start: project.dateAccessed,
          color: 'yellow',
          textColor: 'black',
          url: 'project'
        }
      ];

      setTimeout(() => {
        for (let ks of this.ksList) {
          events.push({
            title: `${ks.title} (Created)`,
            start: ks.dateCreated,
            url: ks.id.value
          });
          ks.dateModified.forEach((d) => {
            events.push({
              title: `${ks.title} (Modified)`,
              start: d,
              url: ks.id.value
            });
          });
          ks.dateAccessed.forEach((d) => {
            events.push({
              title: `${ks.title} (Accessed)`,
              start: d,
              url: ks.id.value
            });
          });
          if (ks.dateDue) {
            events.push({
              title: `(Due): ${ks.title}`,
              start: ks.dateDue,
              color: 'red',
              url: ks.id.value
            });
          }
        }
      }, 500);

      // @ts-ignore
      this.calendarOptions.events = events;

      let ancestors = this.projectService.getAncestors(project.id.value);

      this.breadcrumbs = [];

      for (let ancestor of ancestors) {
        this.breadcrumbs.push({
          label: ancestor.title, id: ancestor.id, title: ancestor.title,
          items: [{label: ancestor.title, id: ancestor.id, title: ancestor.title,}]
        });
      }
    });

    settingsService.app.subscribe((settings) => {
      this.showSubProjects = settings.ks?.table?.showSubProjects ?? false;
      this.generateKsList(this.showSubProjects);
    });
  }

  get canGoBack() {
    return false;
    // return this.projectService.projectCommandCanGoBack;
  }

  get canGoForward() {
    return false;
    // return this.projectService.projectCommandCanGoForward;
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {
  }

  /**
   * Set current Knowledge Source list, making sure icons are visible in the process
   * @param ksList: A list of Knowledge Sources to be displayed in the KsTable
   */
  changeKsList(ksList: KnowledgeSource[]) {
    this.faviconService.extractFromKsList(ksList).then((list) => {
      this.ksList = [...list];
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

  goBack(_: MouseEvent) {
    this.projectService.projectCommandGoBack();
  }

  goForward(_: MouseEvent) {
    this.projectService.projectCommandGoForward();
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
    if ($event.value && typeof $event.value === 'string') {
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

  onKsRemove($event: KnowledgeSource) {
    this.ksCommandService.remove([$event]);
  }

  onKsModified($event: KnowledgeSource) {
    this.ksCommandService.update([$event]);
  }
}
