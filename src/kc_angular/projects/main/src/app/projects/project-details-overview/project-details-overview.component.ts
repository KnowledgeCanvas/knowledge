import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ProjectIdentifiers, ProjectService} from "../../../../../ks-lib/src/lib/services/projects/project.service";
import {ProjectModel} from "projects/ks-lib/src/lib/models/project.model";
import {MatAccordion} from "@angular/material/expansion";
import {KcCalendar} from "../../../../../ks-lib/src/lib/models/calendar.model";
import {Subscription} from "rxjs";
import {ProjectTopicListComponent} from "../project-topic-list/project-topic-list.component";
import {KnowledgeSourceImportDialogComponent, KsImportDialogOutput} from "../../knowledge-source/ks-import-dialog/knowledge-source-import-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {KsFactoryService} from "../../../../../ks-lib/src/lib/services/ks-factory/ks-factory.service";
import {BrowserViewDialogService} from "../../../../../ks-lib/src/lib/services/browser-view-dialog/browser-view-dialog.service";

@Component({
  selector: 'app-canvas-details-overview',
  templateUrl: './project-details-overview.component.html',
  styleUrls: ['./project-details-overview.component.scss']
})
export class ProjectDetailsOverviewComponent implements OnInit, OnDestroy {
  @ViewChild('projectOverview', {static: true}) container!: ElementRef;
  @ViewChild('accordion', {static: true}) Accordion!: MatAccordion
  @ViewChild('topics', {static: true}) topics!: ProjectTopicListComponent;
  currentProject: ProjectModel = new ProjectModel('', {value: ''});
  notes: string[] = [];
  detailsHidden: boolean = true;
  ancestors: ProjectIdentifiers[] = [];
  topicsHidden: boolean = true;
  private subscription: Subscription;
  tooManyAncestorsToDisplay: boolean = false;

  constructor(private projectService: ProjectService, private dialog: MatDialog, private ksFactory: KsFactoryService, private browserViewDialogService: BrowserViewDialogService) {
    this.subscription = projectService.currentProject.subscribe((project: ProjectModel) => {
      if (!project.calendar)
        project.calendar = new KcCalendar();
      this.currentProject = project;

      // Show up to 3 breadcrumbs (including current project)
      let ancestors = projectService.getAncestors(project.id.value);

      if (ancestors.length > 3) {
        this.ancestors = ancestors.slice(ancestors.length - 3);
        this.tooManyAncestorsToDisplay = true;
      } else {
        this.ancestors = ancestors;
        this.tooManyAncestorsToDisplay = false;
      }
      this.topicsHidden = !project.topics || project.topics.length === 0;
    });
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  setDescription() {
    this.projectService.updateProject({id: this.currentProject.id});
  }

  openAll() {
    this.Accordion?.openAll();
  }

  closeAll() {
    this.Accordion?.closeAll();
  }

  setNotes() {
    this.projectService.updateProject({id: this.currentProject.id});
  }

  calStart($event: any) {
    if (this.currentProject.calendar) {
      this.currentProject.calendar.start = $event;
    } else {
      this.currentProject.calendar = new KcCalendar();
      this.currentProject.calendar.start = $event;
    }

    this.projectService.updateProject({id: this.currentProject.id});
  }

  calEnd($event: any) {
    if (this.currentProject.calendar) {
      this.currentProject.calendar.end = $event;
    } else {
      this.currentProject.calendar = new KcCalendar();
      this.currentProject.calendar.end = $event;
    }
    this.projectService.updateProject({id: this.currentProject.id});
  }

  getProjectIcon(): string {
    switch (this.currentProject.type) {
      case "hobby":
        return 'supervised_user_circle';
      case "school":
        return 'school';
      case "work":
        return 'work'
      default:
        return 'folder';
    }
  }

  navigate(id: string) {
    if (id !== this.currentProject.id.value)
      this.projectService.setCurrentProject(id);
  }

  addTopics() {
    this.topicsHidden = false;
  }

  onDetailClick() {
    this.detailsHidden = !this.detailsHidden;

    if (!this.detailsHidden) {
      try {
        setTimeout(() => {
          this.container.nativeElement.scrollTop = this.container.nativeElement.scrollHeight;
        })
      } catch (err) {
      }
    }
  }

  addKnowledgeSource() {
    const dialogRef = this.dialog.open(KnowledgeSourceImportDialogComponent, {
      width: 'auto',
      minWidth: '512px',
      maxWidth: '1024px',
      maxHeight: '80vh',
      data: this.currentProject
    });

    dialogRef.afterClosed().subscribe((output: KsImportDialogOutput) => {
      if (output && output.ingestType === 'search') {
        this.openSearchBrowserView();
      }
    })
  }

  openSearchBrowserView() {
    let searchKS = this.ksFactory.searchKS();
    this.browserViewDialogService.open({ks: searchKS});
  }
}
