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

import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {DomSanitizer} from "@angular/platform-browser";
import {forkJoin} from "rxjs";
import {KnowledgeSource} from "../../models/knowledge.source.model";
import {ElectronIpcService} from "../electron-ipc/electron-ipc.service";

@Injectable({
  providedIn: 'root'
})
export class FaviconExtractorService {
  private googleFaviconSize = '32'
  private googleFaviconServicePrefix = `https://s2.googleusercontent.com/s2/favicons?domain_url=`;
  private googleFaviconServiceSuffix = `&sz=${this.googleFaviconSize}`;
  private defaultIcon = 'assets/img/kc-icon-greyscale.png';
  private loadingGif = 'assets/img/kc-icon-greyscale.png';

  constructor(private httpClient: HttpClient, private sanitizer: DomSanitizer, private ipcService: ElectronIpcService) {
  }

  // NOTE: https://stackoverflow.com/a/45630579
  // NOTE: https://stackoverflow.com/a/15750809
  // NOTE: https://erikmartinjordan.com/get-favicon-google-api
  async extract(urls: string[]): Promise<any[]> {
    return new Promise((resolve, reject) => {
      if (urls === undefined)
        reject(undefined);

      let icons: any[] = [];
      let promises = [];

      for (let url of urls) {
        if (url.includes('github')) {
          url = 'https://github.com/favicon.ico';
        } else if (url.includes('google.com')) {
          url = 'https://google.com/favicon.ico';
        }

        let getUrl = `${this.googleFaviconServicePrefix}${url}${this.googleFaviconServiceSuffix}`;
        promises.push(this.httpClient.get(getUrl, {responseType: 'blob'}));
      }

      forkJoin(promises).subscribe((blobs) => {
        for (let blob of blobs) {
          let objectURL = URL.createObjectURL(blob);
          let icon = this.sanitizer.bypassSecurityTrustUrl(objectURL);
          icons.push(icon);
        }
        resolve(icons);
      }, (error) => {
        console.error('Error while trying to retrieve icons: ', error);
      });
    });
  }

  async extractFromKsList(ksList: KnowledgeSource[]): Promise<KnowledgeSource[]> {
    for (let i = 0; i < ksList.length; i++) {
      let ks = ksList[i];
      ks.icon = this.loading();

      if (ks.ingestType === 'file' && typeof ks.accessLink === 'string') {
        await this.ipcService.getFileIcon([ks.accessLink]).then((icon) => {
          ks.icon = this.sanitizer.bypassSecurityTrustUrl(icon[0]);
        })
      } else {
        if (typeof ks.accessLink === 'string') {
          ks.accessLink = new URL(ks.accessLink);
        }
        let iconUrl = ks.accessLink.hostname;
        ks.iconUrl = iconUrl;
        await this.extract([iconUrl]).then((icon) => {
          ks.icon = icon[0];
        });
      }
    }
    return ksList;
  }


  loading() {
    return this.loadingGif;
  }

  generic() {
    return this.defaultIcon;
  }

  file() {
    return this.defaultIcon;
  }
}
