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
import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {ProjectService} from "../services/factory-services/project.service";
import {KcProject} from "../models/project.model";
import {Subscription} from "rxjs";
import {ProjectCommandService} from "../services/command-services/project-command.service";

@Component({
  selector: 'app-projects',
  template: `
    <div class="h-full w-full flex-row-center-start">
      <app-projects-tree class="h-full max-h-screen flex flex-column flex-shrink-0 border-right-1 border-200"></app-projects-tree>
      <div class="h-full w-full flex-col-center-center">
        <div class="h-full w-full flex flex-row surface-0 p-4" style="max-width: min(calc(100vw - 60px), 150rem) !important; max-height: calc(100vh - 100px)">
          <div class="h-full flex flex-column flex-grow-1 align-items-center justify-content-start overflow-y-auto">
            <div class="h-full w-full flex flex-row px-2 overflow-y-auto align-content-center justify-content-center align-items-start">
              <div>
                <app-project-info *ngIf="kcProject" [project]="kcProject"></app-project-info>
              </div>
              <div *ngIf="!kcProject" class="w-full h-full">
                <p-panel class="h-full w-full">
                  <div class="h-full w-full text-2xl flex-row-center-center">No Projects</div>
                  <div class="h-full w-full text-500 flex-row-center-center">
                    Click the
                    <button pButton disabled class="p-button-text p-button-plain" icon="pi pi-plus" label="Project"></button>
                    button to create a Project
                  </div>
                </p-panel>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ProjectsComponent implements OnInit, OnDestroy {
  projectId: string = '';

  kcProject: KcProject | null = null;

  routeSub: Subscription;

  constructor(private route: ActivatedRoute,
              private pCommand: ProjectCommandService,
              private projects: ProjectService) {

    this.routeSub = route.params.subscribe((params) => {
      this.projectId = params.projectId ?? '';

      this.kcProject = projects.getProject(this.projectId) ?? null;

      if (this.projectId !== projects.getCurrentProjectId()?.value) {
        this.projects.setCurrentProject(this.projectId);
      }
    });
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.routeSub.unsubscribe();
  }
}
