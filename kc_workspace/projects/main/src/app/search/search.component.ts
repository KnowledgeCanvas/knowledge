import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  searchForm: FormGroup;
  searchTerm = new FormControl();
  searchResults: string = '';

  constructor(fb: FormBuilder) {
    this.searchForm = fb.group({
      searchTerm: this.searchTerm
    })
  }

  ngOnInit(): void {
  }

  EnterSubmit($event: any) {
    console.log('Searching for search term: ', this.searchTerm.value);
    if (window.api) {
      // Register callback for when search results are returned
      window.api.receive("app-search-python-results", (data: any) => {
        console.log(`Search results: ${data}`);
        this.searchResults = data;
      });

      // Send message to Electron ipcMain
      let args: object = {
        searchTerm: this.searchTerm.value
      }
      window.api.send("app-search-python", args);
    }
  }
}
