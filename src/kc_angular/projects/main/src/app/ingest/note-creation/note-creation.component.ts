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
    console.log('Setting notes to: ', this.notes);
    if (this.notes.trim() === '') {
      console.warn('Can\'t import a note with empty contents!');
      return;
    }

    console.log('Destination: ', this.destination);
  }

  setDestination(destination: "project" | "queue") {
    console.log('Setting destination to: ', destination);
    this.destination = destination;
  }
}
