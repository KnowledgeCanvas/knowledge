import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {SearchResultsDialogComponent} from "../../search/search-results/search-results-dialog/search-results-dialog.component";
import {CdkDragDrop} from "@angular/cdk/drag-drop";
import {CanvasDropService} from "../../../../../shared/src/services/canvas-drop/canvas-drop.service";
import {MatDialog} from "@angular/material/dialog";
import {ProjectModel, ProjectUpdateRequest} from "../../../../../shared/src/models/project.model";
import {ProjectService} from "../../../../../shared/src/services/projects/project.service";
import {KnowledgeSourceModel} from "../../../../../shared/src/models/knowledge.source.model";
import {CanvasImportComponent} from "../canvas-import/canvas-import.component";

@Component({
  selector: 'app-canvas-source-list',
  templateUrl: './canvas-source-list.component.html',
  styleUrls: ['./canvas-source-list.component.scss']
})
export class CanvasSourceListComponent implements OnInit {
  project: ProjectModel | null = null;
  canvasNodes: KnowledgeSourceModel[] = [];

  constructor(private canvasDropService: CanvasDropService,
              public dialog: MatDialog,
              private projectService: ProjectService,
              private ref: ChangeDetectorRef) {
    this.projectService.currentProject.subscribe(project => {
      console.log('Canvas source list component Current project changed to: ', project);
      if (project?.name && project?.id !== '') {
        this.project = project;
        this.canvasNodes = [];

        if (project.knowledgeSource)
          for (let source of project.knowledgeSource) {
            if (!source.iconUrl) {
              source.iconUrl = `https://${source.googleItem?.displayLink}/favicon.ico`;
            }
            this.canvasNodes.push(source);
          }
      } else {
        this.project = null;
      }
    });
  }

  ngOnInit(): void {
  }

  drop($event: CdkDragDrop<any>) {
    this.canvasNodes = this.canvasDropService.drop($event);

    if (this.project && this.project.id && this.canvasNodes) {
      this.project.knowledgeSource = this.canvasNodes;

      let projectUpdate: ProjectUpdateRequest = {
        id: this.project.id,
        knowledgeSource: this.canvasNodes
      }

      this.projectService.updateProject(projectUpdate);
    }
  }

  displayContextPopup(node: KnowledgeSourceModel) {
    console.log(`Item selected: `, node);
    node.sourceRef = 'list';
    const dialogRef = this.dialog.open(SearchResultsDialogComponent, {
      width: '70%',
      data: node
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog was closed with result: ', result);
      this.ref.markForCheck();
      if (result !== undefined) {
        this.canvasDropService.drop(result)
      }
    })
  }

  addSource() {
    console.log('Add source');
    const dialogRef = this.dialog.open(CanvasImportComponent, {
      width: '50%',
      height: '65%',
      data: this.project
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log('Dialog closed with ', result);
    })
  }

}
