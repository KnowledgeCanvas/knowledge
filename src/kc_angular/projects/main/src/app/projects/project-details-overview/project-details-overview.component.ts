import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ProjectIdentifiers, ProjectService} from "../../../../../ks-lib/src/lib/services/projects/project.service";
import {ProjectModel} from "projects/ks-lib/src/lib/models/project.model";
import {MatAccordion} from "@angular/material/expansion";
import {KcCalendar} from "../../../../../ks-lib/src/lib/models/calendar.model";
import {Subscription} from "rxjs";
import {ProjectTopicListComponent} from "../project-topic-list/project-topic-list.component";

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

  constructor(private projectService: ProjectService) {
    this.subscription = projectService.currentProject.subscribe((project: ProjectModel) => {
      if (!project.calendar)
        project.calendar = new KcCalendar();
      this.currentProject = project;
      this.ancestors = projectService.getAncestors(project.id.value);
      this.topicsHidden = !project.topics || project.topics.length === 0;
    });
  }

  breadCrumbClick(id: string) {
    console.log('clicked breadcrumb with ID: ', id);
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
    console.log('Calendar start changed: ', $event);
    if (this.currentProject.calendar) {
      this.currentProject.calendar.start = $event;
    } else {
      this.currentProject.calendar = new KcCalendar();
      this.currentProject.calendar.start = $event;
    }

    this.projectService.updateProject({id: this.currentProject.id});
  }

  calEnd($event: any) {
    console.log('Calendar end changed: ', $event);
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
    this.projectService.setCurrentProject(id);
  }

  addTopics() {
    this.topicsHidden = false;
    // const element = this.renderer.selectRootElement('#elementId');

    setTimeout(() => {
      this.topics.onFocus();
    })
    console.log('topic element: ',);
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
}
