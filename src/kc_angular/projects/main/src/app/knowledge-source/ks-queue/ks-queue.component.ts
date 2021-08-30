import { Component, OnInit } from '@angular/core';
import {KnowledgeSource} from "../../../../../shared/src/models/knowledge.source.model";

@Component({
  selector: 'app-ks-queue',
  templateUrl: './ks-queue.component.html',
  styleUrls: ['./ks-queue.component.scss']
})
export class KsQueueComponent implements OnInit {
  ksQueue: KnowledgeSource[] = [];

  constructor() { }

  ngOnInit(): void {
  }

  clearResults() {
    
  }
}
