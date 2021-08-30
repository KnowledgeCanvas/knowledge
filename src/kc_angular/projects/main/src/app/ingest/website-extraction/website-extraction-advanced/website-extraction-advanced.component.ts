import {Component, OnInit} from '@angular/core';
import {FormControl} from "@angular/forms";

@Component({
  selector: 'app-website-extraction-advanced',
  templateUrl: './website-extraction-advanced.component.html',
  styleUrls: ['./website-extraction-advanced.component.scss']
})
export class WebsiteExtractionAdvancedComponent implements OnInit {
  extractMetadata = new FormControl(true);
  saveAsPdf = new FormControl(false);
  description = new FormControl('');

  constructor() {
  }

  ngOnInit(): void {
  }

}
