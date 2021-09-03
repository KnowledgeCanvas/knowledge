import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {KsQueueService} from "../../knowledge-source/ks-queue-service/ks-queue.service";

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss']
})
export class SearchBarComponent implements OnInit {
  searchForm: FormGroup;
  searchTerm = new FormControl();
  searchResults: string = '';

  constructor(fb: FormBuilder, private searchService: KsQueueService) {
    this.searchForm = fb.group({
      searchTerm: this.searchTerm
    })
  }

  ngOnInit(): void {
  }

  async EnterSubmit($event: any) {
    await this.searchService.search(this.searchTerm.value);
  }

}
