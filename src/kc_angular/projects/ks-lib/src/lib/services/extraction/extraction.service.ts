import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {WebsiteMetadataModel} from "projects/ks-lib/src/lib/models/website.model";
import {FaviconExtractorService} from "../favicon/favicon-extractor.service";

@Injectable({
  providedIn: 'root'
})
export class ExtractionService {

  constructor(private httpClient: HttpClient, private faviconService: FaviconExtractorService) {
  }

  websiteToPdf(url: string, outFileName?: string) {
    // TODO: move this to ipc service...
    window.api.receive("app-extract-website-results", (data: any) => {
    });

    // Send message to Electron ipcMain
    let args: object = {
      url: url,
      filename: outFileName,
    }
    window.api.send("app-extract-website", args);
  }

  extractWebsiteMetadata(url: string): Promise<WebsiteMetadataModel> {
    return new Promise<WebsiteMetadataModel>((resolve, reject) => {
      let metadata: WebsiteMetadataModel = {};
      this.httpClient.get(url, {responseType: 'text'}).subscribe((htmlString) => {
        let parser = new DOMParser();
        let htmlDoc = parser.parseFromString(htmlString, 'text/html');

        console.log('Attempting to get innerText from html: ', htmlDoc);

        let title = htmlDoc.getElementsByTagName('title')

        console.log('Title elements: ', title);

        if (title && title.length > 0)
          metadata.title = title[0].innerText;
        else
          metadata.title = '';

        this.faviconService.extract([url]).then((icons) => {
          metadata.icon = icons[0];
        }).catch((error) => {
          console.error(error);
        }).finally(() => {
          resolve(metadata);
        })

        // TODO: Revisit this after defining metadata schema
        // let meta = htmlDoc.getElementsByTagName( 'meta' );
        // console.log('Meta tags for ', url, ': ');
        // console.log(meta);
        //
        // for (let i = 0; i < meta.length; i++) {
        //   console.log(meta[i].outerHTML);
        // }


      });
    });
  }
}
