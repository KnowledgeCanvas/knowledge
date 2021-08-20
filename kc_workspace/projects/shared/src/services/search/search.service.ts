import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {BehaviorSubject} from "rxjs";
import {GoogleSearchResultsModel} from "../../models/google.search.results.model";
import {DomSanitizer} from '@angular/platform-browser';
import {FaviconExtractorService} from "../favicon/favicon-extractor.service";
import {KnowledgeSourceModel} from "../../models/knowledge.source.model";
import {SettingsService} from "../settings/settings.service";
import {SettingsModel} from "../../models/settings.model";
import {MatDialog} from "@angular/material/dialog";
import {SearchApiComponent} from "../../../../main/src/app/search/search-api/search-api.component";
import {UuidService} from "../uuid/uuid.service";


@Injectable({
  providedIn: 'root'
})
export class SearchService {
  GOOGLE_SEARCH_PREFIX: string = "https://www.googleapis.com/customsearch/v1";
  private auth = {
    "key": "",
    "engine": "6f8866a3c0d0d967f"
  }
  private settings: SettingsModel = {};
  private ksResults = new BehaviorSubject<KnowledgeSourceModel[]>([]);
  searchList = this.ksResults.asObservable();


  constructor(private httpClient: HttpClient,
              private sanitizer: DomSanitizer,
              private faviconService: FaviconExtractorService,
              private settingsService: SettingsService,
              private dialog: MatDialog,
              private uuidService: UuidService) {
    this.settingsService.getSettings().subscribe((settings) => {
      this.settings = settings;
      if (settings.googleApiKey)
        this.auth.key = settings.googleApiKey;
    });
  }

  async search(term: string) {

    if (!this.settings?.googleApiKey) {
      this.setApiKey(term);
      return;
    }

    const googleSearchUrl = `${this.GOOGLE_SEARCH_PREFIX}?key=${this.auth.key}&cx=${this.auth.engine}&q=${term}`;

    this.httpClient.get<GoogleSearchResultsModel>(googleSearchUrl).subscribe(async (googleResults: GoogleSearchResultsModel) => {
      console.log('Got results from Google: ', googleResults);

      // Construct new KS objects from search results
      let ksResults: KnowledgeSourceModel[] = [];
      let uuids = this.uuidService.generate(googleResults.items.length);

      for (let i = 0; i < googleResults.items.length; i++) {
        let result = googleResults.items[i];

        console.log('Creating new KS: ', result.title, uuids[i]);
        let ks = new KnowledgeSourceModel(result.title, uuids[i], 'google');

        if (result.pagemap?.metatags && result.pagemap.metatags.length > 0) {
          for (let metatag of result.pagemap.metatags) {
            if (metatag['og:description'])
              ks.description = metatag['og:description'];
          }
        }

        let url = new URL(result.link);
        ks.snippet = result.snippet;
        ks.iconUrl = url.hostname;
        ks.googleItem = result;
        ks.icon = this.faviconService.generic();

        this.faviconService.extract(url.hostname).then((icon) => {
          ks.icon = icon;
          this.ksResults.next(ksResults);
        });

        ksResults.push(ks);
      }

      this.ksResults.next(ksResults);
    });
  }

  remove(data: KnowledgeSourceModel) {
    this.ksResults.value.forEach((item, index) => {
      if (item.id.value === data.id.value) {
        this.ksResults.value.splice(index, 1);
      }
    });
  }

  private setApiKey(term: string) {
    const dialogRef = this.dialog.open(SearchApiComponent, {
      width: '50%'
    });
    dialogRef.afterClosed().subscribe((data) => {
      console.log('Setting API key as: ', data);
      this.auth.key = data;
      this.settings.googleApiKey = data;
      this.settingsService.saveSettings(this.settings).subscribe((settings) => {
        this.settings = settings;
      });
      this.search(term);
    });
  }
}
