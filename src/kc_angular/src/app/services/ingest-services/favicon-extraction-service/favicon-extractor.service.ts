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

import {Injectable, SecurityContext} from '@angular/core';
import {HttpClient, HttpResponse} from "@angular/common/http";
import {DomSanitizer, SafeUrl} from "@angular/platform-browser";
import {forkJoin} from "rxjs";
import {KnowledgeSource} from "../../../models/knowledge.source.model";
import {ElectronIpcService} from "../../ipc-services/electron-ipc/electron-ipc.service";

@Injectable({
  providedIn: 'root'
})
export class FaviconExtractorService {
  private googleFaviconSize = '32'
  private googleFaviconServicePrefix = `https://s2.googleusercontent.com/s2/favicons?domain_url=`;
  private googleFaviconServiceSuffix = `&sz=${this.googleFaviconSize}`;
  private defaultIcon = 'assets/img/kc-icon-greyscale.png';
  private loadingIcon = 'assets/img/kc-icon-greyscale.png';

  constructor(private httpClient: HttpClient, private sanitizer: DomSanitizer, private ipcService: ElectronIpcService) {
  }

  loading() {
    return this.loadingIcon;
  }

  generic() {
    return this.defaultIcon;
  }

  file() {
    return this.defaultIcon;
  }

  // NOTE: https://stackoverflow.com/a/45630579, https://stackoverflow.com/a/15750809, https://erikmartinjordan.com/get-favicon-google-api
  async extract(urls: string[]): Promise<any[]> {
    return new Promise((resolve, reject) => {
      if (urls === undefined)
        reject(undefined);

      let icons: any[] = [];
      let promises = [];

      /**
       * Certain urls do not return valid icons when using Google's favicon service.
       * This is a manual way to ensure the correct icons are retrieved.
       * TODO: add new ways to check for this type of issue and handle automatically
       * TODO: keep track of domain/subdomain in icon map and use that to reduce overhead (duplicate icons)
       */
      for (let url of urls) {
        if (url.includes('github')) {
          url = 'https://github.com/favicon.ico';
        } else if (url.includes('google.com')) {
          url = 'https://google.com/favicon.ico';
        }

        let sanitized = this.sanitizer.sanitize(SecurityContext.URL, url);

        url = sanitized ? sanitized : url;

        let getUrl = `${this.googleFaviconServicePrefix}${url}${this.googleFaviconServiceSuffix}`;

        console.warn('Getting icon URL: ', getUrl);

        promises.push(fetch(getUrl).then(response => response.blob()));
      }

      forkJoin(promises).subscribe(blobs => {
        if (!blobs || blobs.length !== promises.length) {
          console.warn('Unable to retrieve favicons for Knowledge Sources...');
          for (let i = 0; i < promises.length; i++) {
            icons.push(this.defaultIcon);
          }
        }

        for (let blob of blobs) {
          if (!blob) {
            icons.push(this.defaultIcon);
          } else {
            let objectURL = URL.createObjectURL(blob);
            let icon = this.sanitizer.bypassSecurityTrustUrl(objectURL);
            icons.push(icon);
          }
        }
        resolve(icons);
      }, error => {
        console.error('Could no get icon...')
        console.error(error);
      });
    });
  }

  webIconsFromKsList(ksList: KnowledgeSource[]) {
    for (let ks of ksList) {
      ks.icon = this.loading();

      let url: string;
      if (typeof ks.accessLink === 'string') {
        ks.accessLink = new URL(ks.accessLink);
      }

      if (ks.accessLink.hostname.includes(ks.accessLink.protocol)) {
        url = ks.accessLink.hostname;
      } else {
        url = ks.accessLink.origin;
      }

      console.log('Extracting icon URL from: ', ks.accessLink);

      if (url.includes('github')) {
        url = 'https://github.com/favicon.ico';
      } else if (url.includes('google.com')) {
        url = 'https://google.com/favicon.ico';
      }

      let getUrl = `${this.googleFaviconServicePrefix}${url}${this.googleFaviconServiceSuffix}`;

      console.warn('Getting icon URL: ', getUrl);

      this.httpClient.get(getUrl, {responseType: 'blob', observe: "response"}).subscribe((response: HttpResponse<Blob>) => {
        const blob = response.body;

        if (!blob) {
          console.warn('Unable to get icon from ', url);
          return;
        }

        // Create object URL and assign sanitized version to ks icon
        let objectURL = URL.createObjectURL(blob);
        ks.icon = this.sanitizer.bypassSecurityTrustUrl(objectURL);

        // Save to local storage for later use (cache)
        const reader = new FileReader();
        reader.onload = (event) => {
          this.iconToDatabase(ks, event.target?.result);
        }
        reader.readAsDataURL(blob);
      }, (error) => {
        console.warn('Caught error trying to get KS icon: ', error);



        if (error.error.type === 'image/png') {

          const blob = error.error;

          // Create object URL and assign sanitized version to ks icon
          let objectURL = URL.createObjectURL(blob);
          ks.icon = this.sanitizer.bypassSecurityTrustUrl(objectURL);

          // Save to local storage for later use (cache)
          const reader = new FileReader();
          reader.onload = (event) => {
            this.iconToDatabase(ks, event.target?.result);
          }
          reader.readAsDataURL(blob);
        }
      })
    }
  }

  iconFromDatabase(ks: KnowledgeSource): SafeUrl | undefined {
    let iconStr = localStorage.getItem(`icon-${ks.id.value}`);

    if (iconStr === 'undefined') {
      console.error('knowledge source icon "undefined" with id ', ks.id.value);
      localStorage.removeItem(`icon-${ks.id.value}`);
      return undefined;
    }

    if (!iconStr) {
      console.warn('did not find icon for knowledge source with id ', ks.id.value);
      return undefined;
    }

    let blob = this.dataURItoBlob(iconStr);
    let objectURL = URL.createObjectURL(blob);
    return this.sanitizer.bypassSecurityTrustUrl(objectURL);
  }

  iconToDatabase(ks: KnowledgeSource, result: string | ArrayBuffer | undefined | null) {
    if (result) {
      localStorage.setItem(`icon-${ks.id.value}`, <string>result);
    } else {
      console.error('refusing to save icon for knowledge source...');
    }
  }

  iconFromCache(ks: KnowledgeSource): SafeUrl | undefined {
    // (in-memory cache) KS might already have an icon
    if (ks.icon && ks.icon !== this.loadingIcon && ks.icon !== this.defaultIcon && ks.icon.length > 0) {
      return ks.icon;
    }

    // Check on-disk cache for icon
    let icon = this.iconFromDatabase(ks);

    if (icon) {
      return icon;
    }

    return undefined;
  }

  async extractFromKsList(ksList: KnowledgeSource[]): Promise<KnowledgeSource[]> {
    let fileList: KnowledgeSource[] = [];
    let filePaths: string[] = [];
    let webList: KnowledgeSource[] = [];

    for (let i = 0; i < ksList.length; i++) {
      let ks = ksList[i];

      // Look for icon in cache hierarchy
      ks.icon = this.iconFromCache(ks);
      if (ks.icon)
        continue;

      // If icon is not in any cache, request it
      if (ks.ingestType === 'file') {
        fileList.push(ks); // File icons will come from Electron IPC
      } else {
        webList.push(ks); // Web icons will come from the favicon service
      }
    }

    fileList.forEach((ks) => {
      filePaths.push(typeof ks.accessLink === 'string' ? ks.accessLink : this.loading());
    })

    this.webIconsFromKsList(webList);

    this.ipcService.getFileIcon(filePaths).then((icons) => {
      for (let i = 0; i < fileList.length; i++) {
        fileList[i].icon = icons[i];
        this.iconToDatabase(fileList[i], icons[i]);
      }
    });

    return ksList;
  }

  dataURItoBlob(dataURI: string) {
    // convert base64 to raw binary data held in a string
    let byteString: string = '';

    try {
      byteString = atob(dataURI.split(',')[1]);
    } catch (e) {
      console.error('Could not decode icon for knowledge source - ', dataURI);
    }

    // separate out the mime component
    let mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to an ArrayBuffer
    let arrayBuffer = new ArrayBuffer(byteString.length);

    let _ia = new Uint8Array(arrayBuffer);

    for (let i = 0; i < byteString.length; i++) {
      _ia[i] = byteString.charCodeAt(i);
    }

    let dataView = new DataView(arrayBuffer);

    return new Blob([dataView], {type: mimeString});
  }
}
