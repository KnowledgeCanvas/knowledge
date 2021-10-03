/**
 Copyright 2021 Rob Royce

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

import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {ProjectModel} from "projects/ks-lib/src/lib/models/project.model";
import {MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-note-creation',
  templateUrl: './note-creation.component.html',
  styleUrls: ['./note-creation.component.scss']
})
export class NoteCreationComponent implements OnInit {
  @Input() currentProject: ProjectModel | undefined = undefined;
  @ViewChild('notesRef') noteElement: ElementRef = {} as ElementRef;
  notes: string = '';
  destination: 'project' | 'queue' = 'project';

  constructor(private dialogRef: MatDialogRef<any>) { }

  ngOnInit(): void {
    setTimeout(() => {
      this.noteElement.nativeElement.focus();
    }, 750);
  }

  cancel() {
    this.dialogRef.close();
  }

  submit() {
    if (this.notes.trim() === '') {
      console.warn('Can\'t import a note with empty contents!');
      return;
    }
  }

  setDestination(destination: "project" | "queue") {
    this.destination = destination;
  }
}
