import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ProjectModel} from "projects/ks-lib/src/lib/models/project.model";
import {MatRadioChange} from "@angular/material/radio";

@Component({
  selector: 'ks-lib-ingest-import-selector',
  templateUrl: './ingest-import-selector.component.html',
  styleUrls: ['./ingest-import-selector.component.css']
})
export class IngestImportSelectorComponent implements OnInit {
  destination: 'project' | 'queue' = 'project';
  @Input() currentProject: ProjectModel | undefined = undefined;
  @Output() selection = new EventEmitter<'project' | 'queue'>();

  constructor() {
  }

  ngOnInit(): void {
    console.log('Ingest-Import-Selector onInit');
    this.selection.emit('project');
  }

  setDestination(change: MatRadioChange) {
    console.log('Mat radio button changed: ', change)
    this.selection.emit(change.value);
  }
}
