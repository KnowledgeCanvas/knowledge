import {Component, OnInit} from '@angular/core';
import {SearchProvider, SearchService} from "../../services/user-services/search.service";
import {DynamicDialogConfig} from "primeng/dynamicdialog";

@Component({
  selector: 'app-topic-search',
  template: `
    <div class="h-full w-full">
      <div id="topic-web-search" class="flex flex-row">
        <h2>Provider</h2>
        {{provider.id}}

        {{provider.title}}

        <app-ks-icon [iconUrl]="provider.iconUrl"></app-ks-icon>
      </div>
      <div id="topic-ks-search" class="flex flex-row">

      </div>
    </div>
  `
})
export class TopicSearchComponent implements OnInit {
  provider: SearchProvider;

  constructor(private config: DynamicDialogConfig,
              private search: SearchService) {
    this.provider = search.provider;
  }

  ngOnInit(): void {
  }

}
