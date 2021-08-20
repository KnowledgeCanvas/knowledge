import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {SearchService} from "../../../../../shared/src/services/search/search.service";

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss']
})
export class SearchBarComponent implements OnInit {
  searchForm: FormGroup;
  searchTerm = new FormControl();
  searchResults: string = '';

  constructor(fb: FormBuilder, private searchService: SearchService) {
    this.searchForm = fb.group({
      searchTerm: this.searchTerm
    })
  }

  ngOnInit(): void {
  }

  async EnterSubmit($event: any) {
    console.log('Searching for search term: ', this.searchTerm.value);
    await this.searchService.search(this.searchTerm.value);
  }

}
