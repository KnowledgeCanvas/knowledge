import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {BehaviorSubject, forkJoin} from "rxjs";
import {GoogleSearchResultsModel, SearchModel} from "../../../../../shared/src/models/google.search.results.model";
import {DomSanitizer} from '@angular/platform-browser';
import {FaviconExtractorService} from "../../../../../ks-lib/src/lib/services/favicon/favicon-extractor.service";
import {
  KnowledgeSource,
  KnowledgeSourceReference,
  SourceModel
} from "../../../../../shared/src/models/knowledge.source.model";
import {SettingsService} from "../../../../../ks-lib/src/lib/services/settings/settings.service";
import {SettingsModel} from "../../../../../shared/src/models/settings.model";
import {MatDialog} from "@angular/material/dialog";
import {SearchApiComponent} from "../../search/search-api-input-dialog/search-api.component";
import {UuidService} from "../../../../../ks-lib/src/lib/services/uuid/uuid.service";
import {BrowserExtensionService} from "../../../../../ks-lib/src/lib/services/browser-extension/browser-extension.service";


@Injectable({
  providedIn: 'root'
})
export class KsQueueService {
  GOOGLE_SEARCH_PREFIX: string = "https://www.googleapis.com/customsearch/v1";
  private auth = {
    "key": "",
    "engine": "6f8866a3c0d0d967f"
  }
  private settings: SettingsModel = {};
  private ksQueueSubject = new BehaviorSubject<KnowledgeSource[]>([]);
  ksQueue = this.ksQueueSubject.asObservable();
  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading = this.loadingSubject.asObservable();

  constructor(private faviconService: FaviconExtractorService, private settingsService: SettingsService,
              private uuidService: UuidService, private sanitizer: DomSanitizer,
              private httpClient: HttpClient, private dialog: MatDialog,
              private browserExtensionService: BrowserExtensionService,) {

    // Subscribe to settings
    this.settingsService.settings.subscribe((settings) => {
      this.settings = settings;
      if (settings.googleApiKey) this.auth.key = settings.googleApiKey;
    });

    this.browserExtensionService.ks.subscribe((ks) => {
      if (ks && ks.ingestType !== 'generic' && ks.title) {
        let ksList = this.ksQueueSubject.value;
        ksList.push(ks);
        this.ksQueueSubject.next(ksList);
      }
    });
  }

  clearResults() {
    this.ksQueueSubject.next([]);
  }

  enqueue(ksList: KnowledgeSource[]) {
    let ksQueue = this.ksQueueSubject.value;
    ksQueue = ksQueue.concat(ksList);
    this.ksQueueSubject.next(ksQueue);
  }

  createKsFromSearchResults(searchResults: SearchModel[]): Promise<KnowledgeSource[]> {
    return new Promise<KnowledgeSource[]>((resolve, reject) => {
      let ksResults: KnowledgeSource[] = [];
      let uuids = this.uuidService.generate(searchResults.length);
      let faviconUrls = [];

      // Get links for all results in order to extract favicons
      for (let result of searchResults) {
        faviconUrls.push(result.link);
      }

      this.faviconService.extract(faviconUrls).then((icons) => {
        for (let i = 0; i < searchResults.length; i++) {
          let result = searchResults[i];
          let source = new SourceModel(undefined, result, undefined);
          let link = new URL(result.link);
          let ref = new KnowledgeSourceReference('search', source, link);

          // TODO: remove ingestType from KS constructor since it's already in the reference
          let ks = new KnowledgeSource(result.title, uuids[i], 'search', ref);
          ks.snippet = result.snippet;
          ks.iconUrl = link.hostname;
          // TODO: remove googleItem from any KS
          ks.googleItem = result;
          ks.icon = icons[i];

          // TODO: extract more meta tags...
          if (result.pagemap?.metatags && result.pagemap.metatags.length > 0) {
            for (let metatag of result.pagemap.metatags) {
              if (metatag['og:description'])
                ks.description = metatag['og:description'];
            }
          }
          ksResults.push(ks);
        }
        resolve(ksResults);
      });
    });
  }

  async topicSearch(topics: string[]) {
    if (!this.settings?.googleApiKey) {
      this.setApiKey(topics);
      return;
    }

    // Notify subscribers that we are loading new KS into the queue
    this.loadingSubject.next(true);

    let searchTerm: string = '';
    let gets: any[] = [];
    let allResults: SearchModel[] = [];
    let googleSearchUrl: string = '';

    // Perform search for all topics ANDed together on Wikipedia
    // searchTerm = topics.join(' AND ') + ' site:wikipedia.org';
    // googleSearchUrl = `${this.GOOGLE_SEARCH_PREFIX}?key=${this.auth.key}&cx=${this.auth.engine}&q=${searchTerm}`;
    // gets.push(this.httpClient.get<GoogleSearchResultsModel>(googleSearchUrl));

    // Perform search for all topics ANDed together on YouTube
    // searchTerm = topics.join(' OR ') + ' site:youtube.com';
    // googleSearchUrl = `${this.GOOGLE_SEARCH_PREFIX}?key=${this.auth.key}&cx=${this.auth.engine}&q=${searchTerm}`;
    // gets.push(this.httpClient.get<GoogleSearchResultsModel>(googleSearchUrl));

    // Perform search for all topics ANDed together
    searchTerm = topics.join(' AND ');
    googleSearchUrl = `${this.GOOGLE_SEARCH_PREFIX}?key=${this.auth.key}&cx=${this.auth.engine}&q=${searchTerm}`;
    gets.push(this.httpClient.get<GoogleSearchResultsModel>(googleSearchUrl));

    // Users can set max number of search results
    let maxNumResults = this.settings.search?.numResults ? this.settings.search.numResults : 10;

    forkJoin(gets).subscribe(results => {
      for (let googleResult of results) {
        let googleItems = (googleResult as GoogleSearchResultsModel).items;

        if (!googleItems) {
          const err = 'KsQueueService failed to convert search items.'
          console.error(err);
          throw new Error(err);
        }

        for (let i = 0; i < maxNumResults; i++)
          allResults.push(googleItems[i]);
      }
      allResults = this.shuffle(allResults);

      this.createKsFromSearchResults(allResults).then((ksResults) => {
        this.enqueue(ksResults);

        // Notify subscribers that loading is done
        this.loadingSubject.next(false);
      });
    });
  }

  async search(term: string) {
    // If the user has not added a Google API key yet, prompt them until one is received
    if (!this.settings?.googleApiKey) {
      this.setApiKey(term);
      return;
    }

    // Notify subscribers that we are loading new KS into the queue
    this.loadingSubject.next(true);

    // Users can set max number of search results
    let maxNumResults = this.settings.search?.numResults ? this.settings.search.numResults : 10;

    // Prepare google search and subscribe to results.
    const googleSearchUrl = `${this.GOOGLE_SEARCH_PREFIX}?key=${this.auth.key}&cx=${this.auth.engine}&q=${term}`;
    this.httpClient.get<GoogleSearchResultsModel>(googleSearchUrl)
      .subscribe((googleResults: GoogleSearchResultsModel) => {
        let items = googleResults.items;

        // Remove results if necessary, based on the max number of items (user setting)
        if (items.length !== maxNumResults)
          items.splice(maxNumResults, items.length - maxNumResults);

        // Create KS objects from results and load them into the queue
        this.createKsFromSearchResults(items).then((ksResults) => {
          this.enqueue(ksResults);
          this.loadingSubject.next(false);
        });
      });
  }

  remove(data: KnowledgeSource) {
    this.ksQueueSubject.next(this.ksQueueSubject.value.filter(ks => ks.id.value !== data.id.value));
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

  private setApiKey(query: string | string[]) {
    const dialogRef = this.dialog.open(SearchApiComponent, {
      width: '50%'
    });

    dialogRef.afterClosed().subscribe((data) => {
      if (!data || data.length <= 5) {
        console.error('Unable to accept invalid API key... please try again');
        dialogRef.close();
        return;
      }

      console.log('Setting API key as: ', data);
      this.auth.key = data;
      this.settings.googleApiKey = data;
      this.settingsService.saveSettings(this.settings);
      if (Array.isArray(query)) {
        this.topicSearch(query);
      } else {
        this.search(query);
      }

    });
  }
}
