import {Component, OnInit} from '@angular/core';
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {KcProject} from "../../models/project.model";

@Component({
  selector: 'app-project-details',
  template: `
    <div class="w-full flex-row-center-between pb-3 pt-3 sticky">
      <div class="flex-row-center-start">
        <!--        <app-ks-icon [ks]="ks" class="pr-3"></app-ks-icon>-->
        <app-project-breadcrumb [disabled]="true"
                                [projectId]="project.id.value">
        </app-project-breadcrumb>
      </div>
      <div class="flex flex-row align-items-center justify-content-center">
        <button pButton
                icon="pi pi-arrow-down"
                label="Expand"
                (click)="expandAll()"
                class="p-button-rounded p-button-text shadow-none"></button>
        <button pButton
                icon="pi pi-arrow-up"
                label="Collapse"
                (click)="collapseAll()"
                class="p-button-rounded p-button-text shadow-none"></button>
      </div>
      <div class="flex-row-center-end" style="width: 10rem">
        <div *ngIf="saved" class="flex-row-center-start text-primary">
          <div class="pi pi-check"></div>
          <div class="px-3">Saved</div>
        </div>
        <div>
          <button pButton class="p-button-text p-button-rounded"
                  icon="pi pi-times" (click)="onClose()">
          </button>
        </div>
      </div>
    </div>
    <div style="height: calc(100% - 65px); overflow-y: auto">
      <app-project-info [project]="project"></app-project-info>
    </div>
  `,
  styles: []
})
export class ProjectDetailsComponent implements OnInit {
  project!: KcProject;

  saved: boolean = false;


  constructor(private config: DynamicDialogConfig,
              private ref: DynamicDialogRef,) {
    console.log('project info dialog with: ', config);
    if (this.config?.data?.project) {
      this.project = this.config.data.project;
    }
  }

  ngOnInit(): void {
  }

  onClose() {
    this.ref.close();
  }

  collapseAll() {

  }

  expandAll() {

  }
}
