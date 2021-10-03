import {Injectable} from '@angular/core';
import {CdkDragDrop, moveItemInArray, transferArrayItem} from "@angular/cdk/drag-drop";

export type KsDropServiceRegistration = {
  containerId: string,
  receiveFrom: string[],
  sendTo: string[],
  allowSort: boolean
}

@Injectable({
  providedIn: 'root'
})
export class KsDropService {
  registration: KsDropServiceRegistration[] = [];

  constructor() {
  }

  register(dropListRegistration: KsDropServiceRegistration) {
    this.registration.push(dropListRegistration);
  }

  unregister(containerId: string) {
    this.registration = this.registration.filter(r => r.containerId !== containerId);
  }

  drop($event: CdkDragDrop<any>) {
    let allowed = this.allowed($event.previousContainer.id, $event.container.id, $event.item.data);

    if (allowed) {
      if ($event.previousContainer === $event.container) {
        moveItemInArray($event.container.data, $event.previousIndex, $event.currentIndex);
      } else {
        transferArrayItem($event.previousContainer.data, $event.container.data, $event.previousIndex, $event.currentIndex);
      }
    }

    return $event.container.data;
  }

  private allowed(from: string, to: string): boolean {
    let fromList = this.registration.find(sr => sr.containerId === from);
    let toList = this.registration.find(sr => sr.containerId === to);

    if (!fromList || !toList) {
      return false;
    }

    if (from === to && fromList.allowSort && toList.allowSort) {
      return true;
    }

    return !(!toList.receiveFrom.includes(from) || !fromList.sendTo.includes(to));
  }
}
