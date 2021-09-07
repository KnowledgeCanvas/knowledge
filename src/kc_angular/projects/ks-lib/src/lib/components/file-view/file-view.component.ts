import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {DomSanitizer, SafeUrl} from "@angular/platform-browser";

@Component({
  selector: 'ks-lib-file-view',
  templateUrl: './file-view.component.html',
  styleUrls: ['./file-view.component.css']
})
export class FileViewComponent implements OnInit, OnChanges {
  @Input() filepath: string | null = null;
  @Output() viewReady = new EventEmitter<boolean>();
  @Output() navEvent = new EventEmitter();
  @Output() clickEvent = new EventEmitter();
  @Output() selectEvent = new EventEmitter();
  safeUrl: SafeUrl | undefined;

  constructor(private sanitizer: DomSanitizer) {
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.filepath) {
      // TODO: verify that this is safe to do with local files
      this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl('file://' + encodeURI(this.filepath));
      this.viewReady.emit(true);
    }
  }
}
