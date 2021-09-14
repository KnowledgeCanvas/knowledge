import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {DomSanitizer} from "@angular/platform-browser";
import {forkJoin} from "rxjs";

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
  async extract(urls: string[]): Promise<any[]> {
    return new Promise((resolve, reject) => {
      if (urls === undefined)
        reject(undefined);

      let icons: any[] = [];
      let promises = [];

      for (let url of urls) {
        let getUrl = `${this.googleFaviconServicePrefix}${url}${this.googleFaviconServiceSuffix}`;
        promises.push(this.httpClient.get(getUrl, {responseType: 'blob'}));
      }

      forkJoin(promises).subscribe((blobs) => {
        for (let blob of blobs) {
          let objectURL = URL.createObjectURL(blob);

          // TODO: figure out how to get past this via some other means
          let icon = this.sanitizer.bypassSecurityTrustUrl(objectURL);

          icons.push(icon);
        }
        resolve(icons);
      });
    });
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
