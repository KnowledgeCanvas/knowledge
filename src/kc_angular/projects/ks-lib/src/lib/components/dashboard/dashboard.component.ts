import {Component, Input, OnInit} from '@angular/core';
import {KnowledgeSource} from "../../models/knowledge.source.model";
import {join} from "@angular/compiler-cli/src/ngtsc/file_system";

interface Tile {
  color: string;
  cols: number;
  rows: number;
  text: string;
  title: string;
  disabled: boolean;
  hidden: boolean;
}

@Component({
  selector: 'ks-lib-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  @Input() ks!: KnowledgeSource;

  tiles: Tile[] = [
    {hidden: false, disabled: false, text: '', title: 'Statistics', cols: 1, rows: 1, color: 'lightblue'},
    {hidden: false, disabled: false, text: '', title: 'Topics', cols: 1, rows: 1, color: 'lightgreen'},
    {hidden: false, disabled: false, text: '', title: 'Related', cols: 1, rows: 1, color: 'lightpink'},
  ];
  constructor() { }

  ngOnInit(): void {
    if (this.ks.notes.length > 0) {
      let text = ''
      this.ks.notes.forEach((note) => {
        text += note.text + ' ';
      })
      this.tiles.push({hidden: false, disabled: false, text: text, title: 'Notes', cols: 1, rows: 1, color: '#DDBDF1'});
    }

    setTimeout(() => {
      console.log('Setting tiles with KS: ', this.ks);
      if (this.ks.notes.length === 0) {
        this.tiles.forEach((tile) => {
          if (tile.title === 'Notes') {
            tile.hidden = true;
          }
        })
      }
    }, 50);
  }

}
