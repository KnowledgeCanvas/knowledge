/**
 Copyright 2022 Rob Royce

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

import {Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {KnowledgeSource} from "../../models/knowledge.source.model";
import {BehaviorSubject, Observable, Subject, tap} from "rxjs";
import {ElectronIpcService} from "../../services/ipc-services/electron-ipc.service";
import {fadeIn} from "../../animations";
import {takeUntil} from "rxjs/operators";

@Component({
  selector: 'app-ks-thumbnail',
  template: `
    <div *ngIf="(thumbnail | async) else loading" class="w-full flex-col-center-center">
      <p-image [src]="thumbnail | async"
               @fadeIn
               class="flex-col-center-center w-full surface-300 thumbnail-container"
               imageClass="ks-thumbnail"
               [style]="{'border-radius': '5px'}"
               [preview]="true">
      </p-image>
    </div>

    <ng-template #loading>
      <div @fadeIn class="flex-col-center-center select-none"
           style="height: 200px; background-color: var(--surface-300); border-radius: 5px;">
        <app-ks-icon [ks]="ks"></app-ks-icon>
        <div class="text-sm mt-4">Thumbnail Unavailable</div>
      </div>
    </ng-template>
  `,
  styles: [
    `
      .thumbnail-container {
        height: 200px;
      }
    `
  ],
  animations: [fadeIn]
})
export class KsThumbnailComponent implements OnInit, OnDestroy, OnChanges {
  @Input() ks!: KnowledgeSource;

  thumbnail$: BehaviorSubject<any> = new BehaviorSubject<any>(undefined);

  thumbnail: Observable<any> = this.thumbnail$.asObservable();

  thumbnailUnavailable: boolean = false;

  private cleanUp: Subject<any> = new Subject<any>();

  constructor(private ipcService: ElectronIpcService) {
  }

  ngOnInit(): void {

  }

  ngOnChanges(changes: SimpleChanges) {
    try {
      if (changes.ks.currentValue) {
        if (changes.ks.currentValue.thumbnail) {
          this.thumbnail$.next(changes.ks.currentValue.thumbnail);
          return;
        }

        if (this.ks.ingestType === 'file') {
          this.ipcService.thumbnail.pipe(
            takeUntil(this.cleanUp),
            tap((thumbnail) => {
              if (thumbnail !== undefined && thumbnail.id && thumbnail.id === this.ks.id.value) {
                this.ks.thumbnail = thumbnail.thumbnail;
                this.thumbnail$.next(this.ks.thumbnail);
              }
            })
          ).subscribe();
        }

        this.getThumbnail();

        setTimeout(() => {
          if (this.thumbnail$.value === undefined) {
            this.thumbnailUnavailable = true;
          }
        }, 1000);
      }
    } catch (e) {

    }
  }

  ngOnDestroy() {
    this.cleanUp.next({});
    this.cleanUp.complete();
  }

  getThumbnail() {
    let link: string = typeof this.ks.accessLink === 'string' ? this.ks.accessLink : this.ks.accessLink.href;

    if (this.ks.ingestType === 'file') {
      this.ipcService.getFileThumbnail([{
        path: link,
        id: this.ks.id.value
      }]);
      return;
    } else {
      if (this.ks.thumbnail) {
        this.thumbnail$.next(this.ks.thumbnail);
      }

      let meta = this.ks.reference.source.website?.metadata?.meta;
      if (meta) {
        let ogImage = meta.find(m => m.key === 'og:image');
        if (ogImage && ogImage.value) {
          const url = ogImage.value;
          fetch(url).then((result) => {
            result.text().then((text) => {
              // Sometimes, requesting an image will return HTML, which is signs of failure
              if (!text.startsWith('<')) {
                this.ks.thumbnail = url;
                this.thumbnail$.next(this.ks.thumbnail);
              }
            })
          }).catch((_) => {
            console.error('Unable to get thumbnail for ', url);
          })
        }
      }
    }
  }

}
