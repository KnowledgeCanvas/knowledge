import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {WebsiteMetadataModel} from "../../../../shared/src/models/website.model";
import {FaviconExtractorService} from "../../../../shared/src/services/favicon/favicon-extractor.service";

@Injectable({
  providedIn: 'root'
})
export class ExtractionService {

  constructor(private httpClient: HttpClient, private faviconService: FaviconExtractorService) {
  }

  extractWebsite(url: string, filename?: string) {
    console.log('Attempting to extract from ', url);
    window.api.receive("app-extract-website-results", (data: any) => {
      console.log(`app-extract-website-results: ${data}`);
    });

    // Send message to Electron ipcMain
    let args: object = {
      url: url,
      filename: filename,
    }
    window.api.send("app-extract-website", args);
  }

  extractWebsiteMetadata(url: string): Promise<WebsiteMetadataModel> {
    return new Promise<WebsiteMetadataModel>((resolve, reject) => {
      let metadata: WebsiteMetadataModel = {};
      this.httpClient.get(url, {responseType: 'text'}).subscribe((htmlString) => {
        let parser = new DOMParser();
        let htmlDoc = parser.parseFromString(htmlString, 'text/html');
        metadata.title = htmlDoc.getElementsByTagName('title')[0].innerText;

        this.faviconService.extract(url).then((icon) => {
          metadata.icon = icon;
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
