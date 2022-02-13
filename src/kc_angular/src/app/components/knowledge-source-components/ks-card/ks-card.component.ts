import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {KnowledgeSource} from "../../../models/knowledge.source.model";
import {ElectronIpcService} from "../../../services/ipc-services/electron-ipc/electron-ipc.service";
import {KsThumbnailRequest} from "kc_electron/src/app/models/electron.ipc.model";

@Component({
  selector: 'app-ks-card',
  templateUrl: './ks-card.component.html',
  styleUrls: ['./ks-card.component.scss']
})
export class KsCardComponent implements OnInit {
  @Input() ks!: KnowledgeSource;
  @Input() showRemove: boolean = true;
  @Input() showPreview: boolean = false;
  @Input() showContentType: boolean = true;
  @Output() onRemove = new EventEmitter<KnowledgeSource>();
  @Output() onPreview = new EventEmitter<KnowledgeSource>();
  @Output() onOpen = new EventEmitter<KnowledgeSource>();

  thumbnail?: string;
  thumbnailUnavailable: boolean = false;
  contentType?: string;
  keywords?: string[];
  description?: string;

  constructor(private ipcService: ElectronIpcService) {
  }

  ngOnInit(): void {
    this.getThumbnail().then((result) => {
      this.thumbnail = result;
    });

    this.getContentType().then((result) => {
      this.contentType = result;
    });

    this.getKeywords().then((result) => {
      this.keywords = result;
    });

    this.getDescription().then((result) => {
      this.description = result;
    })
  }

  async getThumbnail() {
    let link: string = typeof this.ks.accessLink === 'string' ? this.ks.accessLink : this.ks.accessLink.href;
    if (this.ks.ingestType === 'file') {
      let req: KsThumbnailRequest = {
        path: link,
        id: this.ks.id.value
      }
      this.ipcService.getFileThumbnail([req]).then((thumb) => {
        this.thumbnail = thumb[0];
        return thumb[0];
      }).catch((_) => {
        return undefined;
      });

    } else {
      let meta = this.ks.reference.source.website?.metadata?.meta;
      if (meta) {
        let ogImage = meta.find(m => m.key === 'og:image');
        if (ogImage && ogImage.value) {
          return ogImage.value;
        }
      }
    }
    return undefined;
  }

  async getContentType() {
    if (this.ks.ingestType === 'file') {
      return `File (${this.ks.reference.source.file?.type || 'unknown'})`;
    } else {
      let meta = this.ks.reference.source.website?.metadata?.meta;
      if (meta) {
        let ogType = meta.find(m => m.key === 'og:type');
        if (ogType && ogType.value) {
          return ogType.value;
        }
      }
      return 'Website';
    }
  }

  async getKeywords() {
    if (this.ks.ingestType === 'file') {
      return [];
    }

    let meta = this.ks.reference.source.website?.metadata?.meta;
    if (meta) {
      let keywords = meta.find(m => m.key === 'keywords');
      if (keywords && keywords.value) {
        return keywords.value
          .trim()
          .split(',')
          .filter(k => k.trim() !== '');
      }
    }
    return [];
  }

  async getDescription() {
    if (this.ks.ingestType === 'file') {
      return undefined;
    }

    let meta = this.ks.reference.source.website?.metadata?.meta;
    if (meta) {
      let description = meta.find(m => m.key?.includes('description'));
      if (description && description.value) {
        return description.value;
      }
    }

    return undefined;
  }

}
