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
    console.log('Drop service handling event: ', $event);

    if ($event.previousContainer === $event.container) {
      console.log('Attempting to move within current container');
      moveItemInArray($event.container.data, $event.previousIndex, $event.currentIndex);
    } else {
      console.log('Attempting to move to different container');
      console.log('Previous container: ', $event.previousContainer);
      console.log('Next container: ', $event.container);
      console.log('Previous index: ', $event.previousIndex);
      console.log('Next index: ', $event.currentIndex);
      transferArrayItem($event.previousContainer.data, $event.container.data, $event.previousIndex, $event.currentIndex);
    }

    return $event.container.data;
  }

  update($event: CdkDragDrop<any>): void {
  }

  dropSource(data: KnowledgeSourceModel) {

  }
}
