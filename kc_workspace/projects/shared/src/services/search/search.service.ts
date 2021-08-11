import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {BehaviorSubject} from "rxjs";
import {GoogleSearchItemModel, GoogleSearchResultsModel} from "../../models/google.search.results.model";
import {DomSanitizer} from '@angular/platform-browser';
import {FaviconExtractorService} from "../favicon/favicon-extractor.service";
import {KnowledgeSourceModel} from "../../models/knowledge.source.model";

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  GOOGLE_SEARCH_PREFIX: string = "https://www.googleapis.com/customsearch/v1";
  private searchResults = new BehaviorSubject<GoogleSearchItemModel[]>([]);
  currentMessage = this.searchResults.asObservable();

  constructor(private httpClient: HttpClient,
              private sanitizer: DomSanitizer,
              private faviconService: FaviconExtractorService) {
  }

  search(term: string) {
    console.error('You need to set the API key in search.service.ts!');
    const auth = {
      "key": "abcdefg",
      "engine": "6f8866a3c0d0d967f"
    }
    const googleSearchUrl = `${this.GOOGLE_SEARCH_PREFIX}?key=${auth.key}&cx=${auth.engine}&q=${term}`;

    this.httpClient.get<GoogleSearchResultsModel>(googleSearchUrl).subscribe((data: GoogleSearchResultsModel) => {
      for (let res of data.items) {
        res.iconUrl = `https://${res.displayLink}/favicon.ico`;
        this.faviconService.extract(res.link).then((result) => {
          if (result) {
            res.icon = result;
          }
        }).catch((error) => {
          console.error('Unable to extract favicon for ', res.link, error);
        });
      }
      this.searchResults.next(data.items);
    });
  }

  remove(data: KnowledgeSourceModel) {
    this.searchResults.value.forEach((item, index) => {
      if (item.title === data.title) this.searchResults.value.splice(index, 1);
    });
  }
}
