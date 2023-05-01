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
  EmbeddedViewRef,
  Input,
  OnChanges,
  SimpleChanges,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';

@Directive({
  selector: '[appRecreateView]',
})
export class RecreateViewDirective implements OnChanges {
  @Input('appRecreateView') key: any;

  viewRef: EmbeddedViewRef<any> | null = null;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.key) {
      if (this.viewRef) {
        this.destroyView();
      }

      this.createView();
    }
  }

  private destroyView() {
    this.viewRef?.destroy();
    this.viewRef = null;
  }

  private createView() {
    this.viewRef = this.viewContainer.createEmbeddedView(this.templateRef);
  }
}
