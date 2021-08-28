import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {DomSanitizer} from "@angular/platform-browser";

@Injectable({
  providedIn: 'root'
})
export class FaviconExtractorService {
  private googleFaviconSize = '64'
  private googleFaviconServicePrefix = `https://s2.googleusercontent.com/s2/favicons?domain_url=`;
  private googleFaviconServiceSuffix = `&sz=${this.googleFaviconSize}`;
  private defaultIcon = 'assets/img/default.png';
  private loadingGif = 'assets/img/loading.gif';
  private fileIcon = 'assets/img/pdf.png';

  constructor(private httpClient: HttpClient, private sanitizer: DomSanitizer) {
  }

  // NOTE: https://stackoverflow.com/a/45630579
  // NOTE: https://stackoverflow.com/a/15750809
  // NOTE: https://erikmartinjordan.com/get-favicon-google-api
  extract(url: string | string[]): Promise<any> {
    return new Promise((resolve, reject) => {
      if (url === undefined)
        reject(undefined);

      else if (typeof url == 'string') {
        let getUrl: string = `${this.googleFaviconServicePrefix}${url}${this.googleFaviconServiceSuffix}`;
        this.httpClient.get(getUrl, {responseType: 'blob'}).subscribe((blob) => {
          let objectURL = URL.createObjectURL(blob);
          let icon = this.sanitizer.bypassSecurityTrustUrl(objectURL);
          resolve(icon);
        });
      } else {
        let icons: any[] = [];
        for (let u of url) {
          let getUrl: string = `${this.googleFaviconServicePrefix}${url}${this.googleFaviconServiceSuffix}`;
          this.httpClient.get(getUrl, {responseType: 'blob'}).subscribe((blob) => {
            let objectURL = URL.createObjectURL(blob);
            let icon = this.sanitizer.bypassSecurityTrustUrl(objectURL);
            icons.push(icon);
          });
          resolve(icons);
        }
      }
    })
  }

  loading() {
    return this.loadingGif;
  }

  generic() {
    return this.defaultIcon;
  }

  file() {
    return this.fileIcon;
  }
}
