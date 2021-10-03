/**
 Copyright 2021 Rob Royce

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

import {Directive, ElementRef, HostListener, Input, OnChanges, SimpleChanges} from '@angular/core';

@Directive({
  selector: '[ksLibHoverClass]'
})
export class HoverClassDirective implements OnChanges {
  private button: any;
  private delay: number = 0;
  private timeout: any;

  constructor(private elementRef: ElementRef) {
  }

  @Input()
  set ksLibHoverClass(_: any) {
  }

  @Input()
  set ksLibHoverClassDelay(delay: number) {
    this.delay = delay;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.elementRef && this.elementRef.nativeElement && this.elementRef.nativeElement.childNodes) {
      this.button = this.elementRef.nativeElement.childNodes[1];
      this.button.classList.add('ks-icon-affix');
      this.button.classList.add('ks-icon-affix-hidden');
    }
  }

  @HostListener('mouseenter') onMouseEnter() {
    this.timeout = setTimeout(() => {
      this.button.classList.remove('ks-icon-affix-hidden');
    }, this.delay);
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.button.classList.add('ks-icon-affix-hidden');
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  }
}
