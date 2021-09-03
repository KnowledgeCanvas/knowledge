import {Injectable} from '@angular/core';
import {CdkDragDrop, moveItemInArray, transferArrayItem} from "@angular/cdk/drag-drop";
import {KnowledgeSource} from "projects/ks-lib/src/lib/models/knowledge.source.model";


// TODO: rename this to KsDropService
@Injectable({
  providedIn: 'root'
})
export class KsDropService {

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

  dropSource(data: KnowledgeSource) {

  }
}
