import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {BehaviorSubject} from "rxjs";
import {GoogleSearchItemModel, GoogleSearchResultsModel} from "../../models/google.search.results.model";
import {DomSanitizer} from '@angular/platform-browser';
import {FaviconExtractorService} from "../favicon/favicon-extractor.service";
import {KnowledgeSourceModel} from "../../models/knowledge.source.model";
import {SettingsService} from "../settings/settings.service";
import {SettingsModel} from "../../models/settings.model";
import {MatDialog} from "@angular/material/dialog";
import {SearchApiComponent} from "../../../../main/src/app/search/search-api/search-api.component";


@Injectable({
  providedIn: 'root'
})
export class SearchService {
  GOOGLE_SEARCH_PREFIX: string = "https://www.googleapis.com/customsearch/v1";
  private searchResults = new BehaviorSubject<GoogleSearchItemModel[]>([]);
  private settings: SettingsModel = {};
  currentMessage = this.searchResults.asObservable();


  constructor(private httpClient: HttpClient,
              private sanitizer: DomSanitizer,
              private faviconService: FaviconExtractorService,
              private settingsService: SettingsService,
              private dialog: MatDialog) {
    this.settingsService.getSettings().subscribe((settings) => {
      this.settings = settings;
    });
  }

  search(term: string) {
    const auth = {
      "key": "",
      "engine": "6f8866a3c0d0d967f"
    }

    if (this.settings?.googleApiKey)
      auth.key = this.settings.googleApiKey;
    else {
      console.error('Unable to perform search because google API key is missing...');
      const dialogRef = this.dialog.open(SearchApiComponent, {
        width: '50%'
      });
      dialogRef.afterClosed().subscribe((data) => {
        console.log('Setting API key as: ', data);
        auth.key = data;
        this.settings.googleApiKey = data;
        this.settingsService.saveSettings(this.settings).subscribe((settings) => {
          this.settings = settings;
        });
      });
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
