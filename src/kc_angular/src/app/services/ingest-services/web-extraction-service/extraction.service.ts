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
import {CodeModel, WebsiteContentModel, WebsiteMetadataModel, WebsiteModel} from "src/app/models/website.model";

@Injectable({
  providedIn: 'root'
})
export class ExtractionService {
  private MIN_CODE_LENGTH: number = 64;

  constructor(private httpClient: HttpClient) {
  }

  websiteToPdf(url: string, outFileName?: string) {
    // TODO: move this to ipc service...
    window.api.receive("app-extract-website-results", (data: any) => {
      console.info(`app-extract-website-results not implemented...`);
    });

    // Send message to Electron ipcMain
    let args: object = {
      url: url,
      filename: outFileName,
    }
    window.api.send("app-extract-website", args);
  }

  extractWebsite(url: string): Promise<WebsiteModel> {
    return new Promise<WebsiteModel>((resolve, reject) => {

    });
  }

  extractWebsiteContent(url: string): Promise<WebsiteContentModel> {
    return new Promise<WebsiteContentModel>((resolve, reject) => {

    });
  }

  // Specific-purpose extractions such as Wikipedia, StackOverflow, etc.
  extractWikipedia(url: string): Promise<WebsiteModel> {
    return new Promise<WebsiteModel>((resolve, reject) => {

    });
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
          console.debug('Original meta: ', meta);

          let extractedMeta = [];

          for (let i = 0; i < meta.length; i++) {
            // Charset
            if (meta[i].attributes && meta[i].attributes[0].name === 'charset') {
              extractedMeta.push({key: 'charset', value: meta[i].attributes[0].textContent, property: ''})
            }

            // Open Graph property:content pairs
            if (meta[i].attributes && meta[i].attributes.length == 2) {
              let attr = {
                key: meta[i].attributes[0].textContent,
                value: meta[i].attributes[1].textContent,
                property: ''
              };
              extractedMeta.push(attr);
            }

            // Open Graph property:content triples
            if (meta[i].attributes && meta[i].attributes.length == 3) {
              let attr = {
                key: meta[i].attributes[0].textContent,
                value: meta[i].attributes[2].textContent,
                property: meta[i].attributes[1].textContent
              };
              extractedMeta.push(attr);
            }

            // Other stuff TODO: verify
            if (meta[i].attributes && meta[i].attributes.length == 4) {
              let attr = {
                key: meta[i].name,
                value: meta[i].content,
                property: meta[i].attributes.getNamedItem('property')?.nodeValue ?? ''
              };
              extractedMeta.push(attr);
            }
          }

          metadata.meta = extractedMeta;
        }


        // Article Tag TODO: comprehensive testing and verification
        let article = htmlDoc.getElementsByTagName('article');
        if (article && article.length) {
          console.log('Article before parsing: ', article);

          for (let i = 0; i < article.length; i++) {
            let a = article[i];

            let aTitle = metadata.title;
            if (a.title) {
              aTitle = a.title
            } else {
              a.childNodes.forEach((value, key) => {
                if (value.nodeName === 'H1' || value.nodeName === 'h1') {
                  if (value.textContent)
                    aTitle = value.textContent;
                }
              });
            }
            metadata.article = {
              title: aTitle,
              type: a.attributes.getNamedItem('itemtype')?.nodeValue ?? undefined,
              text: a.textContent ?? undefined,
              html: a.innerHTML
            };
          }

        }

        // Code tags
        let code = htmlDoc.getElementsByTagName('code');
        if (code && code.length) {
          let codeHtml: CodeModel[] = [];
          for (let i = 0; i < code.length; i++) {
            // @ts-ignore
            if (code[i].textContent?.length && code[i].textContent?.length > this.MIN_CODE_LENGTH) {
              let c: CodeModel = {
                html: code[i].outerHTML
              }
              codeHtml.push(c);
            }
          }
          metadata.code = codeHtml;
        }

        // Answers (StackOverflow)
        let answers = htmlDoc.getElementById('answers');
        if (answers) {
          console.warn('Answer extraction not implemented but an answer field was detected...');
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
        .catch(error => reject(error));
    })
  }
}
