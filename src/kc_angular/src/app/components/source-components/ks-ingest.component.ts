/**
 Copyright 2022 Rob Royce

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
import {Component, Input, SecurityContext} from '@angular/core';
import {KnowledgeSource} from "../../models/knowledge.source.model";
import {KnowledgeSourceFactoryRequest, KsFactoryService} from "../../services/factory-services/ks-factory.service";
import {NotificationsService} from "../../services/user-services/notifications.service";
import {ExtractorService} from "../../services/ingest-services/extractor.service";
import {ElectronIpcService} from "../../services/ipc-services/electron-ipc.service";
import {IngestService} from "../../services/ingest-services/ingest.service";
import {UuidService} from "../../services/ipc-services/uuid.service";
import {FaviconService} from "../../services/ingest-services/favicon.service";
import {DragAndDropService} from "../../services/ingest-services/drag-and-drop.service";
import {KsCommandService} from "../../services/command-services/ks-command.service";
import {ProjectService} from "../../services/factory-services/project.service";
import {KcProject} from "../../models/project.model";
import {DialogService} from "primeng/dynamicdialog";
import {ProjectCreationDialogComponent} from "../project-components/project-creation-dialog.component";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {OverlayPanel} from "primeng/overlaypanel";
import {DomSanitizer} from "@angular/platform-browser";
import {HttpClient} from "@angular/common/http";

@Component({
  selector: 'app-ks-ingest',
  template: `
    <div class="grid w-full">
      <div class="col-11 flex-row-center-start">
        <button pButton
                label="Project"
                icon="pi pi-plus"
                class="mr-2 hover:bg-primary"
                (click)="onAddProject($event)">
        </button>
        <p-fileUpload #fileUploadButton
                      class="mr-2"
                      styleClass="hover:bg-primary"
                      mode="basic"
                      name="files[]"
                      [multiple]="true"
                      (onSelect)="onAddFile($event); fileUploadButton.clear()"
                      chooseLabel="File">
        </p-fileUpload>
        <button pButton
                label="Link"
                icon="pi pi-plus"
                class="mr-2 hover:bg-primary"
                (click)="overlayPanel.toggle($event)">
        </button>
        <p-checkbox *ngIf="currentProject && currentProject.name && currentProject.name.length > 0"
                    label="Import to '{{currentProject.name}}'"
                    [(ngModel)]="importToProject"
                    [binary]="true">
        </p-checkbox>
      </div>
      <div class="col-1 flex-row-center-end">
        <div class="h-full flex-row-center-center ml-4">
          <div class="pi pi-sliders-h cursor-pointer flex-col-center-center"
               #importSettings
               [hidden]="true"
               style="height: 28px"
               (click)="onImportSettings($event)">
          </div>
        </div>
      </div>
    </div>

    <app-dropzone [shouldShorten]="ksList.length > 0"
                  *ngIf="ksList.length === 0"
                  [supportedTypes]="supportedTypes"
                  hintMessage="Supported types: {{supportedTypes.join(', ')}}">
    </app-dropzone>

    <p-overlayPanel #overlayPanel
                    styleClass="surface-100 shadow-7"
                    (onShow)="onLinkShow($event)"
                    appendTo="body">
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
                   (keyup.enter)="onLinkSubmit(linkInput.value, overlayPanel)"
                   style="min-width: 300px;"
                   placeholder="Enter a URL and press enter/return">
            <span class="p-inputgroup-addon"
                  [class.p-disabled]="linkForm.controls.url.errors"
                  [class.cursor-pointer]="linkInput.value.length"
                  (click)="onLinkSubmit(linkInput.value, overlayPanel)">
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
export class KsIngestComponent {
  @Input() ksList: KnowledgeSource[] = [];

  @Input() currentProject: KcProject | null = null;

  supportedTypes: string[] = ["Links", "Files"];

  files: File[] = [];

  importToProject: boolean = false;

  linkForm: FormGroup;

  constructor(private notifications: NotificationsService,
              private dialog: DialogService,
              private extractor: ExtractorService,
              private uuid: UuidService,
              private dnd: DragAndDropService,
              private favicon: FaviconService,
              private formBuilder: FormBuilder,
              private httpClient: HttpClient,
              private ingest: IngestService,
              private command: KsCommandService,
              private ipc: ElectronIpcService,
              private projects: ProjectService,
              private sanitizer: DomSanitizer,
              private factory: KsFactoryService) {
    this.supportedTypes = dnd.supportedTypes;

    this.linkForm = formBuilder.group({
      url: ['', [Validators.required, Validators.pattern('https?://.+[.]+.+')]]
    });
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

  enqueue(ksList: KnowledgeSource[]) {
    if (this.importToProject) {
      const project = this.projects.getProject(this.currentProject?.id ?? '');
      if (project && project.knowledgeSource) {
        project.knowledgeSource = project.knowledgeSource.concat(ksList);
      } else if (project && !project.knowledgeSource) {
        project.knowledgeSource = ksList;
      } else {
        this.ingest.enqueue(ksList);
        return;
      }

      if (project) {
        this.projects.updateProjects([{id: project.id}]);
        this.notifications.success('Import', project.name, ksList.length > 1 ? 'Sources Added' : 'Source Added');
      }
    } else {
      this.ingest.enqueue(ksList);
    }
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
          this.notifications.error('Source Import', 'Unable to import URL', value);
          return;
        }

        this.enqueue(ksList);

      }).catch((_) => {
        this.notifications.error('Source Import', 'Unable to import URL', value);
      });
    }, (_) => {
      this.notifications.error('Source Import', 'Invalid URL', value);
      return;
    });


    // TODO: setup web workers to extract website info asynchronously
    // TODO: make it so these things can be enqueued in Inbox even while they are still loading
  }

  onAddFile($event: any) {
    const files: any[] = $event.currentFiles;
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

      this.enqueue(ksList);

    }).catch((reason) => {
      this.notifications.error('Source Import', `Unable to import file${files.length > 1 ? 's' : ''}`, reason);
    });
  }

  onAddProject(_: MouseEvent) {
    this.dialog.open(ProjectCreationDialogComponent, {
      width: `min(90vw, 92rem)`,
      data: {parentId: undefined},
      contentStyle: {
        'border-bottom-left-radius': '6px',
        'border-bottom-right-radius': '6px'
      }
    })
  }

  onImportSettings(_: MouseEvent) {
    this.ingest.show();
  }

  onLinkShow(_: any) {
    this.linkForm.reset();
  }

  async onLinkSubmit(value: string, overlayPanel: OverlayPanel) {
    if (!this.linkForm.controls.url || this.linkForm.controls.url.errors || value.length < 4) {
      this.notifications.error('Source Import', 'Invalid URL', value);
      return;
    }

    overlayPanel.hide();
    await this.extract(value);
  }
}
