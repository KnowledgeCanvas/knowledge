import {Component, EventEmitter, HostListener, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'ks-lib-ks-ingest-fab',
  templateUrl: './ks-ingest-fab.component.html',
  styleUrls: ['./ks-ingest-fab.component.scss']
})
export class KsIngestFabComponent implements OnInit {
  @Input() kcProjectId?: string;

  @Input() ksFabAnimate: boolean = true;

  @Output() ksFabExpanded = new EventEmitter<boolean>();

  @Output() ksFabHovering = new EventEmitter<boolean>();

  hovering: boolean = false;
  actions: { label: string, click: () => void }[] = [
    {
      label: 'Add a file',
      click: this.addFile
    },
    {
      label: 'Add a link',
      click: this.addLink
    },
    {
      label: 'Search all topics',
      click: this.topicSearch
    },
    {
      label: 'Search the web',
      click: this.search
    }
  ];

  constructor() {
  }

  addFile() {
    console.log('Add a file...');
  }

  addLink() {
    console.log('Add a link...');
  }

  topicSearch() {
    console.log('Topic search...');
  }

  search() {
    console.log('Search...');
  }

  @HostListener('mouseenter') onMouseEnter() {
    this.hovering = true;
    this.ksFabHovering.emit(this.hovering);
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.hovering = false;
    this.ksFabHovering.emit(this.hovering);
  }

  ngOnInit(): void {
  }

  fabExpand($event: MouseEvent) {
    this.ksFabExpanded.emit(true);
  }

  addKs() {

  }
}
