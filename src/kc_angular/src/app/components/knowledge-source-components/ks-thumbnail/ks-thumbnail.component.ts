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

import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {KnowledgeSource} from "../../../models/knowledge.source.model";
import {Subscription} from "rxjs";
import {ElectronIpcService} from "../../../services/ipc-services/electron-ipc.service";

@Component({
  selector: 'app-ks-thumbnail',
  templateUrl: './ks-thumbnail.component.html',
  styleUrls: ['./ks-thumbnail.component.scss']
})
export class KsThumbnailComponent implements OnInit, OnDestroy {
  @Input() ks!: KnowledgeSource;

  thumbnail: any;

  thumbnailUnavailable: boolean = false;

  private _subThumbnail?: Subscription;

  constructor(private ipcService: ElectronIpcService) { }

  ngOnInit(): void {
    if (this.ks.ingestType === 'file') {
      this._subThumbnail = this.ipcService.thumbnail.subscribe((thumbnail) => {
        if (thumbnail !== undefined && thumbnail.id && thumbnail.id === this.ks.id.value) {
          this.thumbnail = thumbnail.thumbnail;
        }
      });
    }

    this.getThumbnail();

    setTimeout(() => {
      if (this.thumbnail === undefined) {
        this.thumbnailUnavailable = true;
      }
    }, 1000);
  }

  ngOnDestroy() {
    if (this._subThumbnail) {
      this._subThumbnail.unsubscribe();
    }
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
      let meta = this.ks.reference.source.website?.metadata?.meta;
      if (meta) {
        let ogImage = meta.find(m => m.key === 'og:image');
        if (ogImage && ogImage.value) {
          const url = ogImage.value;
          fetch(url).then((result) => {
            result.text().then((text) => {
              // Sometimes, requesting an image will return HTML, which is signs of failure
              if (!text.startsWith('<')) {
                this.thumbnail = url;
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
