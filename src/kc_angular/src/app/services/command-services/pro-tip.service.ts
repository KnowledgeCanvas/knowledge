/*
 * Copyright (c) 2023 Rob Royce
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { OverlayPanel } from 'primeng/overlaypanel';
import { ProTipsComponent } from '@components/shared/pro-tips.component';
import { ProTip } from '@app/directives/pro-tip.directive';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { NotificationsService } from '@services/user-services/notifications.service';

@Injectable({
  providedIn: 'root',
})
export class ProTipService {
  private overlayPanel!: OverlayPanel;

  private component!: ProTipsComponent;

  private proTips: ProTip[] = [];

  private selection = new BehaviorSubject<ProTip[]>([]);

  private index = new BehaviorSubject<number>(0);

  private proTip = new BehaviorSubject<ProTip | null>(null);

  proTip$ = this.proTip.asObservable();

  selection$ = this.selection.asObservable();

  index$ = this.index.asObservable();

  constructor(private notify: NotificationsService) {
    this.proTip$.subscribe((t: ProTip | null) => {
      if (t) {
        this.createOverlay(t);
      }
    });

    /* Wait for either the selection or index to change, then update the active pro tip accordingly. */
    combineLatest([
      this.selection$,
      this.index$.pipe(
        distinctUntilChanged((a, b) => a === b),
        debounceTime(400)
      ),
    ]).subscribe(([s, i]) => {
      if (s.length > 0 && i >= 0 && i < s.length && s[i].element && s[i].view) {
        this.proTip.next(s[i]);
      } else {
        this.proTip.next(s[0]);
      }
    });
  }

  hide() {
    this.overlayPanel.hide();
  }

  setProTip(tip: ProTip) {
    this.component.header = tip.name;
    this.component.body = tip.message;
    this.component.icon = tip.icon ? tip.icon : 'pi pi-info-circle';
  }

  createOverlay(t: ProTip) {
    this.overlayPanel.hide();

    setTimeout(() => {
      this.setProTip(t);

      // Modify the nativeElement to ensure the overlay panel is positioned correctly
      const top = t.element.nativeElement.style.top;
      const left = t.element.nativeElement.style.left;
      t.element.nativeElement.style.position = 'relative';
      t.element.nativeElement.style.top = t.offsetY;
      t.element.nativeElement.style.left = t.offsetX;

      // Create a mouse click event to pass to the overlay panel (provides the position)
      const event = new MouseEvent('click', {
        view: t.view.element.nativeElement.ownerDocument.defaultView,
        bubbles: true,
        cancelable: true,
      });
      this.overlayPanel.show(event, t.element.nativeElement);

      // Reset the nativeElement position
      setTimeout(() => {
        t.element.nativeElement.style.top = top;
        t.element.nativeElement.style.left = left;
      });
    }, 250);
  }

  register(proTip: ProTip) {
    // Do not add duplicate tips
    if (
      this.proTips.find(
        (t) => t.name === proTip.name && t.message === proTip.message
      )
    ) {
      return;
    }
    this.proTips.push(proTip);
  }

  setTarget(target: OverlayPanel, component: ProTipsComponent) {
    this.overlayPanel = target;
    this.overlayPanel.dismissable = false;
    this.component = component;
    this.setListeners();
  }

  setListeners() {
    this.component.next.subscribe(() => {
      this.index.next((this.index.value + 1) % this.selection.value.length);
    });

    this.component.previous.subscribe(() => {
      this.index.next(
        (this.index.value - 1 + this.selection.value.length) %
          this.selection.value.length
      );
    });
  }

  show() {
    this.overlayPanel.hide();
    this.proTip.next(null);
    this.index.next(0);
    this.selection.next(this.proTips);
  }

  showByName(name: string) {
    // Filter the tips by name and display them in order
    this.selection.next(this.proTips.filter((t) => t.name === name));
  }

  showByGroup(group: string) {
    // Filter the tips by group and display them in order
    const nextTips = this.proTips.filter((t) => t.groups.includes(group));
    if (!nextTips.length) {
      this.notify.success(
        'Pro Tips',
        `No ${group} tips found.`,
        `Try again after visiting a ${group} view.`
      );
    } else {
      this.selection.next(nextTips);
    }
  }

  unregister(name: string) {
    this.proTips = this.proTips.filter((t) => t.name !== name);
  }
}
