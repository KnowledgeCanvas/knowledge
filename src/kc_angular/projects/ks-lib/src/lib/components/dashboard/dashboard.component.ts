import {Component, Input, OnInit} from '@angular/core';
import {KnowledgeSource} from "../../models/knowledge.source.model";

@Component({
  selector: 'ks-lib-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  @Input() ks!: KnowledgeSource;

  constructor() {
  }

  ngOnInit(): void {
  }
}
