import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SecurityContext, SimpleChanges} from '@angular/core';
import {ElectronIpcService, ElectronNavEvent} from "../../services/electron-ipc/electron-ipc.service";
import {IpcResponse, KsBrowserViewRequest} from "kc_electron/src/app/models/electron.ipc.model";
import {DomSanitizer} from "@angular/platform-browser";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'ks-lib-browser-view',
  templateUrl: './browser-view.component.html',
  styleUrls: ['./browser-view.component.css']
})
export class BrowserViewComponent implements OnInit, OnChanges {
  @Input() url: URL | undefined;
  @Output() viewReady = new EventEmitter<boolean>();
  @Output() onIpcResponse = new EventEmitter<IpcResponse>();
  @Output() navEvent = new EventEmitter<string>();
  @Output() clickEvent = new EventEmitter();
  @Output() selectEvent = new EventEmitter();

  constructor(private ipcService: ElectronIpcService, private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.url.firstChange) {
      console.log('URL initialized to: ', changes.url.currentValue);
      this.loadBrowserView();
    }
  }

  loadBrowserView() {
    if (!this.url) {
      console.error('Unable to load resource with invalid URL...');
      return;
    }

    let sanitizedUrl = this.sanitizer.sanitize(SecurityContext.URL, this.url.href);
    if (!sanitizedUrl) {
      console.error('Unable to load resource with invalid URL...');
      return;
    }

    let position = this.getBrowserViewDimensions('browser-view');

    // TODO: REMOVE
    console.log('Browser view dimensions: ', position);

    let request: KsBrowserViewRequest = {
      url: sanitizedUrl,
      x: Math.floor(position.x),
      y: Math.floor(position.y),
      width: Math.floor(position.width),
      height: Math.floor(position.height)
    }

    this.ipcService.openBrowserView(request).then((response: IpcResponse) => {
      if (response.success) {
        this.viewReady.emit(true);
      }
      this.onIpcResponse.emit(response);
    });

    this.ipcService.navEvent.subscribe((url) => {
      this.navEvent.emit(url);
    })
  }



  getBrowserViewDimensions(elementName: string): any {
    let element = document.getElementById(elementName);
    if (element) {
      return element.getBoundingClientRect();
    }
  }

}
