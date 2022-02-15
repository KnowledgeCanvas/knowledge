import {Component, Input, OnInit} from '@angular/core';
import {KnowledgeSource} from "../../../models/knowledge.source.model";

@Component({
  selector: 'app-ks-dataview',
  templateUrl: './ks-dataview.component.html',
  styleUrls: ['./ks-dataview.component.scss']
})
export class KsDataviewComponent implements OnInit {
  @Input() ksList!: KnowledgeSource[];

  constructor() { }

  ngOnInit(): void {
  }

}
