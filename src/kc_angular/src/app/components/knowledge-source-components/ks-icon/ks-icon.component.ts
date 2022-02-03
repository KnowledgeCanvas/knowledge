import {Component, Input, OnInit} from '@angular/core';
import {KnowledgeSource} from "../../../models/knowledge.source.model";

@Component({
  selector: 'app-ks-icon',
  templateUrl: './ks-icon.component.html',
  styleUrls: ['./ks-icon.component.scss']
})
export class KsIconComponent implements OnInit {
  @Input() ks!: KnowledgeSource;
  @Input() showEditor: boolean = true;

  constructor() { }

  ngOnInit(): void {
  }

}
