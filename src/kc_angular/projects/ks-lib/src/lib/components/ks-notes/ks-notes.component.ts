import {Component, Input, OnInit} from '@angular/core';
import {KnowledgeSource, KnowledgeSourceNote} from "../../models/knowledge.source.model";

@Component({
  selector: 'ks-lib-ks-notes',
  templateUrl: './ks-notes.component.html',
  styleUrls: ['./ks-notes.component.css']
})
export class KsNotesComponent implements OnInit {

  @Input()
  ks!: KnowledgeSource;

  constructor() {

  }

  ngOnInit(): void {
    console.log('Notes component constructed with KS: ', this.ks);
  }

  addNote() {
    if (!this.ks.notes || this.ks.notes.length === 0) {
      this.ks.notes = [KnowledgeSourceNote.blank()];
    } else {
      this.ks.notes.push(KnowledgeSourceNote.blank());
    }
  }

  ready() {
    return this.ks.notes.length > 0;
  }
}
