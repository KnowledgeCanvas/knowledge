import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {DomSanitizer} from "@angular/platform-browser";

@Injectable({
  providedIn: 'root'
})
export class FaviconExtractorService {
  googleFaviconServicePrefix = `https://s2.googleusercontent.com/s2/favicons?domain_url=`;
  googleFaviconServiceSuffix = `&sz=32`;

  constructor(private httpClient: HttpClient, private sanitizer: DomSanitizer) { }

  extract(url: string): Promise<any> {
    // NOTE: https://stackoverflow.com/a/45630579 and https://stackoverflow.com/a/15750809 and https://erikmartinjordan.com/get-favicon-google-api
    return new Promise((resolve, reject) => {
      let getUrl: string = `${this.googleFaviconServicePrefix}${url}${this.googleFaviconServiceSuffix}`;
      console.log('Getting icon from ', getUrl);
      this.httpClient.get(getUrl, {responseType: 'blob'}).subscribe((blob) => {
        let objectURL = URL.createObjectURL(blob);
        let icon = this.sanitizer.bypassSecurityTrustUrl(objectURL);
        resolve(icon);
      });
    })
  }
}
