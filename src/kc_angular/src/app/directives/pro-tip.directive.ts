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

import {
  Directive,
  ElementRef,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewContainerRef,
} from '@angular/core';
import { ProTipService } from '@services/command-services/pro-tip.service';
import { BehaviorSubject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

export interface ProTip {
  // The name of the Pro Tip, will be used as header text
  name: string;

  // The message to display
  message: string;

  // When calling showByGroup, use this to determine which steps to show
  groups: string[];

  // The element to display the tip next to (e.g. a button)
  element: ElementRef;

  // The view container to display the tip in (e.g. the app component)
  view: ViewContainerRef;

  // The x offset from the element as a string (e.g. '0', '10px', or '-2rem')
  offsetX?: string;

  // The y offset from the element as a string (e.g. '0', '10px', or '-2rem')
  offsetY?: string;

  // The PrimeNG icon to display in the tip header
  icon?: string;
}

@Directive({
  selector: '[proTip]',
})
export class ProTipDirective implements OnChanges, OnDestroy {
  @Input() tipHeader!: string;

  @Input() tipMessage!: string;

  @Input() tipGroups!: string[];

  @Input() tipOffsetX = '0';

  @Input() tipOffsetY = '0';

  @Input() tipHidden = false;

  @Input() tipIcon = '';

  @Input() tipShowOnHover = false;

  private hover = new BehaviorSubject<boolean>(false);

  hover$ = this.hover.asObservable();

  private subscriber: Subscription;

  constructor(
    private el: ElementRef,
    private viewContainer: ViewContainerRef,
    private proTips: ProTipService
  ) {
    this.subscriber = this.hover$
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((h) => {
        if (h === true && this.tipShowOnHover) {
          this.proTips.showByName(this.tipHeader);
        } else if (this.tipShowOnHover) {
          this.proTips.hide();
        }
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.tipHidden?.currentValue === true) {
      this.proTips.unregister(this.tipHeader);
    } else {
      const proTip: ProTip = {
        name: this.tipHeader,
        message: this.tipMessage,
        groups: this.tipGroups,
        element: this.el,
        view: this.viewContainer,
        offsetX: this.tipOffsetX,
        offsetY: this.tipOffsetY,
        icon: this.tipIcon,
      };
      this.proTips.register(proTip);
    }
  }

  ngOnDestroy() {
    if (this.tipHeader) {
      this.proTips.unregister(this.tipHeader);
    }
    this.subscriber.unsubscribe();
  }

  /* Monitor hover events and display the tip when the user hovers over the element for more than 500ms */
  @HostListener('mouseover')
  onMouseEnter() {
    if (this.tipShowOnHover) {
      this.hover.next(true);
    }
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    if (this.tipShowOnHover) {
      this.hover.next(false);
    }
  }

  @HostListener('click')
  onClick() {
    if (this.tipShowOnHover) {
      this.hover.next(false);
    }
  }
}
