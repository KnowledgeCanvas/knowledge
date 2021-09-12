import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {DomSanitizer, SafeUrl} from "@angular/platform-browser";
import {KcViewportHeaderConfig, KcViewportHeaderEvent} from "../shared/viewport-header/viewport-header.component";

export interface KcFileViewConfig {
  filePath: string,
  isDialog?: true
}

export interface KcFileViewEvents {
}

export interface KcFileViewClickEvent extends KcViewportHeaderEvent {
}

@Component({
  selector: 'ks-lib-file-view',
  templateUrl: './file-view.component.html',
  styleUrls: ['./file-view.component.css']
})
export class FileViewComponent implements OnInit, OnChanges {
  @Input() config!: KcFileViewConfig;
  @Output() viewReady = new EventEmitter<boolean>();
  // @Output() navEvent = new EventEmitter();
  @Output() clickEvent = new EventEmitter<KcFileViewClickEvent>();
  // @Output() selectEvent = new EventEmitter();
  safeUrl: SafeUrl | undefined;
  headerConfig: KcViewportHeaderConfig | undefined;

  constructor(private sanitizer: DomSanitizer) {
  }

  ngOnInit(): void {
    this.headerConfig = {
      canCopy: true,
      canClose: this.config.isDialog,
      displayText: this.config.filePath,
      displayTextReadOnly: true,
      showActionButtons: true,
      showDisplayText: true
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.config.filePath) {
      // TODO: verify that this is safe to do with local files
      this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl('file://' + encodeURI(this.config.filePath));
      this.viewReady.emit(true);
    }
  }

  headerEvents(headerEvent: KcViewportHeaderEvent) {
    this.clickEvent.emit(headerEvent);
  }
}
