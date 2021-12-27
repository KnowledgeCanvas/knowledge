import {Component, Inject, Input, OnInit} from '@angular/core';
import {KnowledgeSource, KnowledgeSourceNote} from "../../models/knowledge.source.model";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'ks-lib-ks-notes',
  templateUrl: './ks-notes.component.html',
  styleUrls: ['./ks-notes.component.css']
})
export class KsNotesComponent implements OnInit {
  @Input() ks!: KnowledgeSource;

  ksNote: string = '';

  constructor(private dialogRef: MatDialogRef<any>,
              @Inject(MAT_DIALOG_DATA) public data: { ksNote: KnowledgeSourceNote }) {
  }

  ngOnInit(): void {
    this.ksNote = this.data.ksNote.text ?? '';
  }

  save() {
    let ksNote = this.data.ksNote;
    ksNote.dateModified = Date();
    ksNote.text = this.ksNote;
    this.dialogRef.close(ksNote);
  }

  cancel() {
    this.dialogRef.close();
  }
}
