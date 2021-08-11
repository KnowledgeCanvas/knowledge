import {Component, Input, OnInit} from '@angular/core';
import {ProjectModel} from "../../../../shared/src/models/project.model";

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss']
})
export class CanvasComponent implements OnInit {
  project: ProjectModel | null = null;

  constructor() {
  }

  ngOnInit(): void {

  }




}
