import {Component, OnInit} from '@angular/core';
import {ProjectModel} from "projects/ks-lib/src/lib/models/project.model";

@Component({
  selector: 'app-canvas',
  templateUrl: './knowledge-canvas.component.html',
  styleUrls: ['./knowledge-canvas.component.scss']
})
export class KnowledgeCanvasComponent implements OnInit {
  project: ProjectModel | null = null;

  constructor() {
  }

  ngOnInit(): void {
  }
}
