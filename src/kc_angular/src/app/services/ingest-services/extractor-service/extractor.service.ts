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
import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {NotificationsService} from "../../user-services/notification-service/notifications.service";
import {ArticleModel, CodeModel, WebsiteContentModel, WebsiteMetadataModel, WebSourceModel} from "../../../../../../kc_shared/models/web.source.model";

@Injectable({
  providedIn: 'root'
})
export class ExtractorService {
  private MIN_CODE_LENGTH: number = 64;

  constructor(private httpClient: HttpClient, private notifications: NotificationsService) {
  }

  websiteToPdf(url: string, outFileName?: string) {
    // TODO: move this to ipc service...
    window.api.receive("E2A:Extraction:Website", (data: any) => {
      this.notifications.debug('ExtractorService', 'E2A:Extraction:Website', 'Not implemented yet.');
    });

    // Send message to Electron ipcMain
    let args: object = {
      url: url,
      filename: outFileName,
    }
    window.api.send("A2E:Extraction:Website", args);
  }

  extractWebsite(url: string): Promise<WebSourceModel> {
    return new Promise<WebSourceModel>((resolve, reject) => {

    });
  }

  extractWebsiteContent(url: string): Promise<WebsiteContentModel> {
    return new Promise<WebsiteContentModel>((resolve, reject) => {

    });
  }

  // Specific-purpose extractions such as Wikipedia, StackOverflow, etc.
  extractWikipedia(url: string): Promise<WebSourceModel> {
    return new Promise<WebSourceModel>((resolve, reject) => {

    });
  }

  async extractWebsiteArticle(url: string) {
    this.httpClient.get(url, {responseType: 'text'}).subscribe((htmlString) => {
      let parser = new DOMParser();
      let htmlDoc = parser.parseFromString(htmlString, 'text/html');
      let articles = htmlDoc.getElementsByTagName('article');

      if (!articles) {
        return null;
      }

      if (articles.length > 1) {
        this.notifications.debug('ExtractorService', 'Multiple Articles Detected', 'Returning first instance only.');
      }

      let article = articles[0];
      let title = '';

      if (article.title) {
        title = article.title
      } else {
        article.childNodes.forEach((value, key) => {
          if (value.nodeName === 'H1' || value.nodeName === 'h1') {
            if (value.textContent) {
              title = value.textContent;
              return;
            }
          }
        });
      }

      let articleModel: ArticleModel = {
        title: title,
        type: article.attributes.getNamedItem('itemtype')?.nodeValue ?? undefined,
        text: article.textContent ?? undefined,
        html: article.innerHTML
      };

      return articleModel;
    })
  }

  async extractWebsiteCode(url: string) {
    this.httpClient.get(url, {responseType: 'text'}).subscribe((htmlString) => {
      let parser = new DOMParser();
      let htmlDoc = parser.parseFromString(htmlString, 'text/html');

      // Code tags
      let code = htmlDoc.getElementsByTagName('code');
      if (!code || code.length === 0) {
        return null;
      }

      let codeHtml: CodeModel[] = [];
      for (let i = 0; i < code.length; i++) {
        if (code[i].textContent?.length && (code[i].textContent?.length ?? 0) > this.MIN_CODE_LENGTH) {
          let c: CodeModel = {
            html: code[i].outerHTML
          }
          codeHtml.push(c);
        }
      }
      return codeHtml;
    })
  }

  async extractWebsiteAnswers(url: string) {
    this.httpClient.get(url, {responseType: 'text'}).subscribe((htmlString) => {
      let parser = new DOMParser();
      let htmlDoc = parser.parseFromString(htmlString, 'text/html');

      // Answers (StackOverflow)
      let answers = htmlDoc.getElementById('answers');
      if (answers) {
        this.notifications.debug('ExtractorService', '"Answers" Detected', 'Not implemented yet.')
      }
    })
  }

  extractWebsiteMetadata(url: string): Promise<WebsiteMetadataModel> {
    return new Promise<WebsiteMetadataModel>((resolve) => {
      let metadata: WebsiteMetadataModel = {};
      this.httpClient.get(url, {responseType: 'text'}).subscribe((htmlString) => {
        let parser = new DOMParser();
        let htmlDoc = parser.parseFromString(htmlString, 'text/html');

        // Title Tag
        let title = htmlDoc.getElementsByTagName('title')
        if (title && title.length > 0)
          metadata.title = title[0].innerText;
        else
          metadata.title = url;

        // Meta Tags
        let meta = htmlDoc.getElementsByTagName('meta');
        if (meta && meta.length) {
          let extractedMeta = [];
          for (let i = 0; i < meta.length; i++) {
            // Charset tag
            if (meta[i].attributes && meta[i].attributes[0].name === 'charset') {
              extractedMeta.push({key: 'charset', value: meta[i].attributes[0].textContent, property: ''})
            }

            // Open Graph tags
            if (meta[i]?.attributes[0]?.textContent?.startsWith('og:')) {
              let val = '';
              if (!meta[i].attributes[1]?.textContent?.startsWith('og:')) {
                val = meta[i].attributes[1].textContent ?? '';
              } else {
                val = meta[i].attributes[2].textContent ?? '';
              }

              if (val !== '') {
                let attr = {
                  key: meta[i].attributes[0]?.textContent,
                  value: val,
                  property: ''
                };
                extractedMeta.push(attr);
                if (attr.key === 'og:title' && attr.value) {
                  metadata.title = attr.value;
                }
              }
            }
          }
          metadata.meta = extractedMeta;
        }
        resolve(metadata);
      });
    });
  }

  async textFromFile(file: File): Promise<any> {
    return new Promise<string>((resolve, reject) => {
      let headers = new Headers();
      headers.append("Content-Type", file.type);
      headers.append('Accept', 'text/html');
      headers.append('X-Tika-OCRLanguage', 'eng');

      let requestOptions: RequestInit = {
        method: 'PUT',
        headers: headers,
        body: file,
        redirect: 'follow'
      };

      fetch("http://localhost:9998/tika", requestOptions)
        .then(response => {
          response.text().then((raw) => {
            let parser = new DOMParser();
            let doc = parser.parseFromString(raw, 'text/html');
            resolve(raw);
          })
        })
        .catch(error => {
          this.notifications.error('ExtractorService', 'Tika Error', error);
          reject(error)
        });
    })
  }
}
