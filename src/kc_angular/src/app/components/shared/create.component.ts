/*
 * Copyright (c) 2022-2023 Rob Royce
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
import {Component, OnInit, SecurityContext} from '@angular/core';
import {ProjectCreationDialogComponent} from "../project-components/project-creation-dialog.component";
import {DialogService} from "primeng/dynamicdialog";
import {KnowledgeSourceFactoryRequest, KsFactoryService} from "../../services/factory-services/ks-factory.service";
import {NotificationsService} from "../../services/user-services/notifications.service";
import {KnowledgeSource} from "../../models/knowledge.source.model";
import {IngestService} from "../../services/ingest-services/ingest.service";
import {OverlayPanel} from "primeng/overlaypanel";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ExtractorService} from "../../services/ingest-services/extractor.service";
import {UuidService} from "../../services/ipc-services/uuid.service";
import {DragAndDropService} from "../../services/ingest-services/drag-and-drop.service";
import {FaviconService} from "../../services/ingest-services/favicon.service";
import {HttpClient} from "@angular/common/http";
import {DomSanitizer} from "@angular/platform-browser";
import {ConfirmationService} from "primeng/api";

@Component({
  selector: 'app-create',
  template: `
    <div class="flex-row-center-center non-header" (dragstart)="$event.preventDefault()">
      <button pButton icon="pi pi-folder"
              class="p-button-text outline-none shadow-none non-header"
              pTooltip="Create a Project"
              (click)="onNewProject($event)">+
      </button>
      <button pButton icon="pi pi-file"
              class="p-button-text outline-none shadow-none non-header"
              pTooltip="Import Files"
              (click)="newFile.click()">+
      </button>
      <input [(ngModel)]="files" #newFile hidden type="file" [multiple]="true" (change)="onNewFile($event)">
      <button pButton icon="pi pi-link"
              class="p-button-text outline-none shadow-none non-header"
              pTooltip="Import a Website"
              (click)="createPanel.toggle($event)">+
      </button>
    </div>

    <p-overlayPanel #createPanel
                    appendTo="body"
                    [focusOnShow]="true"
                    (onShow)="onLinkShow($event)"
                    styleClass="surface-100 shadow-7">
      <ng-template pTemplate="content">
        <form [formGroup]="linkForm">
          <div class="p-inputgroup">
            <input pInputText
                   #linkInput
                   id="linkInput"
                   formControlName="url"
                   required
                   [autofocus]="true"
                   class="border-0"
                   type="url"
                   (keyup.enter)="onLinkSubmit(linkInput.value, createPanel)"
                   style="min-width: 300px;"
                   placeholder="Enter a URL and press enter/return">
            <span class="p-inputgroup-addon"
                  [class.p-disabled]="linkForm.controls.url.errors"
                  [class.cursor-pointer]="linkInput.value.length"
                  (click)="onLinkSubmit(linkInput.value, createPanel)">
            <i class="pi pi-arrow-circle-right"></i>
          </span>
          </div>
          <div *ngIf="linkForm.controls.url.errors?.pattern" class="p-error">
            Enter a valid URL (e.g. https://example.com)
          </div>
        </form>
      </ng-template>
    </p-overlayPanel>
  `,
  styles: []
})
export class CreateComponent implements OnInit {
  ksList: KnowledgeSource[] = [];

  linkForm: FormGroup;

  files: any[] = [];

  constructor(private dialog: DialogService,
              private confirm: ConfirmationService,
              private factory: KsFactoryService,
              private ingest: IngestService,
              private notifications: NotificationsService,
              private extractor: ExtractorService,
              private uuid: UuidService,
              private dnd: DragAndDropService,
              private favicon: FaviconService,
              private formBuilder: FormBuilder,
              private sanitizer: DomSanitizer,
              private httpClient: HttpClient) {
    this.linkForm = formBuilder.group({
      url: ['', [Validators.required, Validators.pattern('https?://.+[.]+.+')]]
    });
  }

  ngOnInit(): void {
  }

  linkExists(value: string) {
    return this.ksList.find(ks => {
      if (typeof ks.accessLink === 'string') {
        return ks.accessLink.includes(value);
      } else {
        return ks.accessLink.href.includes(value);
      }
    });
  }

  async extract(value: string) {
    // Check for duplicates
    if (this.linkExists(value)) {
      this.notifications.debug('KsIngest', 'Link Already Pending', value);
      return;
    }

    let sanitized = this.sanitizer.sanitize(SecurityContext.URL, value);
    let url: URL;
    try {
      url = new URL(sanitized ? sanitized : value);
    } catch (e: any) {
      this.notifications.error('Source Import', 'Invalid URL', e);
      return;
    }

    this.httpClient.get(url.href, {responseType: "text"}).subscribe((_) => {
      let req: KnowledgeSourceFactoryRequest = {
        ingestType: 'website',
        links: [url]
      }

      this.factory.many(req).then((ksList) => {
        if (!ksList || !ksList.length) {
          this.notifications.error('Source Import', `Unable to import URL`, value);
          return;
        }

        this.ingest.enqueue(ksList);

      }).catch((error) => {
        this.notifications.error('Source Import', `Unable to import URL`, `Source Factory: ${value}`);
      });
    }, (error) => {
      this.notifications.error('Source Import', `Invalid URL`, `HTTP Client: ${value}`);
      console.log(error)

      // If the link cannot be reached, ask the user if they still want to import it anyway
      this.confirm.confirm({
        header: "Link Unreachable",
        message: `
        <div>
            <div style="max-width: 12rem;">
                ${url.href} is unreachable.
            </div>
            <br>
            <div style="max-width: 12rem;">
                Sometimes this happens when the website is behind a paywall, requires authentication, or expects certain cookies.
            </div>
            <br>
            <div>
                  You can still add it to Knowledge and we will attempt to extract information from it later on.
            </div>
            <br>
            <div>
                  Do you want to import it anyway?
            </div>
        </div>
        `,
        icon: 'pi pi-warn',
        acceptLabel: 'Import',
        rejectLabel: 'Cancel',
        accept: () => {
          let req: KnowledgeSourceFactoryRequest = {
            ingestType: 'website',
            links: [url]
          }

          this.factory.many(req).then((ksList) => {
            if (!ksList || !ksList.length) {
              this.notifications.error('Source Import', `Unable to import URL`, value);
              return;
            }

            this.ingest.enqueue(ksList);

          }).catch((error) => {
            this.notifications.error('Source Import', `Unable to import URL`, `Source Factory: ${value}`);
          });
        }
      });
      return;
    });


    // TODO: setup web workers to extract website info asynchronously
    // TODO: make it so these things can be enqueued in Inbox even while they are still loading
  }

  onNewProject(_: MouseEvent) {
    this.dialog.open(ProjectCreationDialogComponent, {
      width: `min(90vw, 92rem)`,
      data: {parentId: undefined},
      contentStyle: {
        'border-bottom-left-radius': '6px',
        'border-bottom-right-radius': '6px'
      }
    })
  }

  onNewFile($event: any) {
    const files: any[] = $event.target.files;
    if (!files) {
      return;
    }

    let req: KnowledgeSourceFactoryRequest = {
      ingestType: 'file',
      files: files
    };

    this.factory.many(req).then((ksList) => {
      if (!ksList || !ksList.length) {
        this.notifications.error('Source Import', `Unable to import file${files.length > 1 ? 's' : ''}`, '');
        return;
      }

      this.ingest.enqueue(ksList);

    }).catch((reason) => {
      this.notifications.error('Source Import', `Unable to import file${files.length > 1 ? 's' : ''}`, reason);
    }).finally(() => {
      this.files = [];
    });
  }

  async onLinkSubmit(value: string, overlayPanel: OverlayPanel) {
    if (!this.linkForm.controls.url || this.linkForm.controls.url.errors || value.length < 4) {
      this.notifications.error('Source Import', 'Invalid URL', value);
      return;
    }

    overlayPanel.hide();
    await this.extract(value);
  }

  onLinkShow(_: any) {
    this.linkForm.reset();
  }
}
