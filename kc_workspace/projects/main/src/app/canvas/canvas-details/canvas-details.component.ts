import {Component, OnInit} from '@angular/core';
import {ThemePalette} from "@angular/material/core";
import {ProjectModel} from "../../../../../shared/src/models/project.model";
import {ProjectService} from "../../../../../shared/src/services/projects/project.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-canvas-details',
  templateUrl: './canvas-details.component.html',
  styleUrls: ['./canvas-details.component.scss']
})
export class CanvasDetailsComponent implements OnInit {
  background: ThemePalette;
  links: string[] = [
    ''
  ];
  activeLink: string = '';
  project: ProjectModel | null = null;
  activeLinkIndex = 0;
  navLinks: any[];

  constructor(private projectService: ProjectService, private router: Router) {
    this.navLinks = [
      {
        label: 'Overview',
        link: 'app-canvas-details-overview',
        index: 0
      },
      {
        label: 'Knowledge Source',
        link: 'app-knowledge-source-view',
        index: 1
      }
    ];
    this.projectService.currentProject.subscribe(project => {
      if (project?.name && project?.id !== '') {
        this.project = project;
      } else {
        this.project = null;
      }
    });
  }

  ngOnInit(): void {
    this.router.events.subscribe((res) => {
      let newIndex = this.navLinks.find(tab => tab.link === '.' + this.router.url);
      if (newIndex)
        this.activeLinkIndex = this.navLinks.indexOf(newIndex);
    });
  }

}
