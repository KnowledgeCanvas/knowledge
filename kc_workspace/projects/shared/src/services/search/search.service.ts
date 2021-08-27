import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {BehaviorSubject, forkJoin} from "rxjs";
import {GoogleSearchResultsModel, SearchModel} from "../../models/google.search.results.model";
import {DomSanitizer} from '@angular/platform-browser';
import {FaviconExtractorService} from "../favicon/favicon-extractor.service";
import {KnowledgeSource, KnowledgeSourceReference, SourceModel} from "../../models/knowledge.source.model";
import {SettingsService} from "../settings/settings.service";
import {SettingsModel} from "../../models/settings.model";
import {MatDialog} from "@angular/material/dialog";
import {SearchApiComponent} from "../../../../main/src/app/search/search-api/search-api.component";
import {UuidService} from "../uuid/uuid.service";
import {ChromeExtensionService} from "../chrome-extension/chrome-extension.service";


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
  private ksQueue = new BehaviorSubject<KnowledgeSource[]>([]);
  searchList = this.ksQueue.asObservable();

  constructor(private chromeExtensionService: ChromeExtensionService,
              private faviconService: FaviconExtractorService,
              private settingsService: SettingsService,
              private uuidService: UuidService,
              private sanitizer: DomSanitizer,
              private httpClient: HttpClient,
              private dialog: MatDialog) {

    this.settingsService.getSettings().subscribe((settings) => {
      this.settings = settings;
      if (settings.googleApiKey)
        this.auth.key = settings.googleApiKey;
    });

    this.chromeExtensionService.ks.subscribe((ks) => {
      if (ks && ks.ingestType !== 'generic' && ks.title) {
        let ksList = this.ksQueue.value;
        // A kind-of hacky way to append Chrome results if the queue already contains Chrome results..
        if (ksList.length > 0 && ksList[0].ingestType === 'website') {
          ksList.push(ks);
          this.ksQueue.next(ksList);
        } else {
          this.ksQueue.next([ks]);
        }
      }
    });
  }

  async topicSearch(topics: string[]) {
    if (!this.settings?.googleApiKey) {
      this.setApiKey(topics);
      return;
    }
    let searchTerm: string = '';
    let gets: any[] = [];
    let allResults: SearchModel[] = [];
    let googleSearchUrl: string = '';

    // Perform search for all topics ANDed together on Wikipedia
    searchTerm = topics.join(' AND ') + ' site:wikipedia.org';
    googleSearchUrl = `${this.GOOGLE_SEARCH_PREFIX}?key=${this.auth.key}&cx=${this.auth.engine}&q=${searchTerm}`;
    gets.push(this.httpClient.get<GoogleSearchResultsModel>(googleSearchUrl));

    // Perform search for all topics ANDed together on YouTube
    searchTerm = topics.join(' OR ') + ' site:youtube.com';
    googleSearchUrl = `${this.GOOGLE_SEARCH_PREFIX}?key=${this.auth.key}&cx=${this.auth.engine}&q=${searchTerm}`;
    gets.push(this.httpClient.get<GoogleSearchResultsModel>(googleSearchUrl));

    // Perform search for all topics ANDed together
    searchTerm = topics.join(' AND ');
    googleSearchUrl = `${this.GOOGLE_SEARCH_PREFIX}?key=${this.auth.key}&cx=${this.auth.engine}&q=${searchTerm}`;
    gets.push(this.httpClient.get<GoogleSearchResultsModel>(googleSearchUrl));

    forkJoin(gets).subscribe(results => {
      console.log('Results: ', results);
      for (let googleResult of results) {
        if ((googleResult as GoogleSearchResultsModel).items)
          for (let item of (googleResult as GoogleSearchResultsModel).items) {
            let exists = allResults.find(i => i.link === item.link);
            if (!exists)
              allResults.push(item);
          }
      }
      allResults = this.shuffle(allResults);

      let ksResults: KnowledgeSource[] = [];
      let uuids = this.uuidService.generate(allResults.length);

      for (let i = 0; i < allResults.length; i++) {
        let result = allResults[i];
        let source = new SourceModel(undefined, result, undefined);
        let link = new URL(result.link);
        let ref = new KnowledgeSourceReference('search', source, link);
        let ks = new KnowledgeSource(result.title, uuids[i], 'google', ref);

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
          this.ksQueue.next(ksResults);
        });
        ksResults.push(ks);
      }
      this.ksQueue.next(ksResults);
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
      let ksResults: KnowledgeSource[] = [];
      let uuids = this.uuidService.generate(googleResults.items.length);

      for (let i = 0; i < googleResults.items.length; i++) {
        let result = googleResults.items[i];

        console.log('Creating new KS: ', result.title, uuids[i]);

        let source = new SourceModel(undefined, result, undefined);
        let link = new URL(result.link);
        let ref = new KnowledgeSourceReference('search', source, link);
        let ks = new KnowledgeSource(result.title, uuids[i], 'google', ref);

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
          this.ksQueue.next(ksResults);
        });

        ksResults.push(ks);
      }

      this.ksQueue.next(ksResults);
    });
  }

  remove(data: KnowledgeSource) {
    this.ksQueue.next(this.ksQueue.value.filter(ks => ks.id.value !== data.id.value));
  }

  shuffle(array: SearchModel[]): SearchModel[] {
    let currentIndex = array.length, randomIndex;

    // While there remain elements to shuffle...
    while (currentIndex != 0) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }

    return array;
  }

  clearResults() {
    this.ksQueue.next([]);
  }

  private setApiKey(query: string | string[]) {
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
      if (Array.isArray(query)) {
        this.topicSearch(query);
      } else {
        this.search(query);
      }

    });
  }
}
