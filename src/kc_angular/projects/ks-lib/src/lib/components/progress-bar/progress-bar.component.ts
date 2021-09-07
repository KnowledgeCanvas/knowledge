import { Component, OnInit } from '@angular/core';
import {KsQueueService} from "../../../../../main/src/app/knowledge-source/ks-queue-service/ks-queue.service";

@Component({
  selector: 'ks-lib-progress-bar',
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.css']
})
export class ProgressBarComponent implements OnInit {
  loading: boolean = false;

  constructor(private ksQueueService: KsQueueService) {
    ksQueueService.loading.subscribe((loading) => {
      this.loading = loading;
    })
  }

  ngOnInit(): void {
  }

}
