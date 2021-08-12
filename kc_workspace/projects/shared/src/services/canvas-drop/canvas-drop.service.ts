import {Injectable} from '@angular/core';
import {CdkDragDrop, moveItemInArray, transferArrayItem} from "@angular/cdk/drag-drop";
import {BehaviorSubject} from "rxjs";
import {CanvasNodeModel} from "../../models/canvas.model";
import {GoogleSearchResultsModel} from "../../models/google.search.results.model";
import {KnowledgeSourceModel} from "../../models/knowledge.source.model";

@Injectable({
  providedIn: 'root'
})
export class CanvasDropService {

  constructor() {
  }

  drop($event: CdkDragDrop<any>) {
    if ($event.previousContainer === $event.container) {
      moveItemInArray($event.container.data, $event.previousIndex, $event.currentIndex);
    } else {
      transferArrayItem($event.previousContainer.data, $event.container.data, $event.previousIndex, $event.currentIndex);
    }

    return $event.container.data;
  }

  update($event: CdkDragDrop<any>): void {
  }

  dropSource(data: KnowledgeSourceModel) {

  }
}
