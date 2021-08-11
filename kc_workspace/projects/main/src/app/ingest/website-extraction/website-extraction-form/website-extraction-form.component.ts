import {Component, Input, OnInit} from '@angular/core';
import {FormControl} from "@angular/forms";

@Component({
  selector: 'app-website-extraction-form',
  templateUrl: './website-extraction-form.component.html',
  styleUrls: ['./website-extraction-form.component.scss']
})
export class WebsiteExtractionFormComponent implements OnInit {
  @Input() url: FormControl;

  constructor() {
    this.url = new FormControl();
  }

  ngOnInit(): void {
  }
}
