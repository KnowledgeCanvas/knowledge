import {Component, OnInit} from '@angular/core';
import {ProjectModel} from "projects/ks-lib/src/lib/models/project.model";
import {KsQueueService} from "../ks-queue-service/ks-queue.service";

@Component({
  selector: 'app-canvas',
  templateUrl: './knowledge-canvas.component.html',
  styleUrls: ['./knowledge-canvas.component.scss']
})
export class KnowledgeCanvasComponent implements OnInit {
  project: ProjectModel | null = null;
  searchBarVisible: boolean = false;

  constructor(private ksQueueService: KsQueueService) {
    ksQueueService.ksQueue.subscribe((ksList) => {
      // Used to set the height of knowledge-canvas-container, because otherwise the project details become hidden underneath the footer (would be nice not to have to do this!)
      this.searchBarVisible = ksList.length > 0;
    })
  }

  ngOnInit(): void {
  }
}
