import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {CdkDragDrop} from "@angular/cdk/drag-drop";
import {CanvasDropService} from "../../../../../shared/src/services/canvas-drop/canvas-drop.service";
import {MatDialog} from "@angular/material/dialog";
import {ProjectModel, ProjectUpdateRequest} from "../../../../../shared/src/models/project.model";
import {ProjectService} from "../../../../../shared/src/services/projects/project.service";
import {KnowledgeSourceModel} from "../../../../../shared/src/models/knowledge.source.model";
import {CanvasImportComponent} from "../canvas-import/canvas-import.component";
import {KsInfoDialogComponent} from "../../knowledge-source/ks-info-dialog/ks-info-dialog.component";
import {FaviconExtractorService} from "../../../../../shared/src/services/favicon/favicon-extractor.service";

@Component({
  selector: 'app-canvas-source-list',
  templateUrl: './canvas-source-list.component.html',
  styleUrls: ['./canvas-source-list.component.scss']
})
export class CanvasSourceListComponent implements OnInit {
  project: ProjectModel | null = null;
  canvasNodes: KnowledgeSourceModel[] = [];
  private CONTAINER_ID = 'knowledge-canvas-sidebar';

  constructor(private canvasDropService: CanvasDropService,
              public dialog: MatDialog,
              private projectService: ProjectService,
              private ref: ChangeDetectorRef,
              private faviconService: FaviconExtractorService) {
    this.projectService.currentProject.subscribe(project => {
      if (project?.name && project?.id.value !== '') {
        this.project = project;
        this.canvasNodes = [];

        if (project.knowledgeSource)
          for (let source of project.knowledgeSource) {
            if (source.ingestType === 'file') {
              source.icon = faviconService.file();
            } else {
              source.icon = faviconService.loading();
              faviconService.extract(source.iconUrl).then(icon => source.icon = icon);
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

    console.log('Drop event: ', $event);

    if (this.project && this.project.id && $event.previousContainer !== $event.container) {
      let projectUpdate: ProjectUpdateRequest = {
        id: this.project.id,
        addKnowledgeSource: [$event.item.data]
      }
      this.projectService.updateProject(projectUpdate);
    }
  }

  displayContextPopup(node: KnowledgeSourceModel) {
    console.log(`Item selected: `, node);
    node.sourceRef = 'list';
    const dialogRef = this.dialog.open(KsInfoDialogComponent, {
      width: '70%',
      data: node,
      autoFocus: false
    });
    dialogRef.afterClosed().subscribe(result => {
      this.ref.markForCheck();
      if (result !== undefined) {
        this.canvasDropService.drop(result)
      }
    })
  }

  addSource() {
    console.log('Add source');
    const dialogRef = this.dialog.open(CanvasImportComponent, {
      width: '65%',
      data: this.project
    });
    dialogRef.afterClosed().subscribe((result) => {
    })
  }

}
