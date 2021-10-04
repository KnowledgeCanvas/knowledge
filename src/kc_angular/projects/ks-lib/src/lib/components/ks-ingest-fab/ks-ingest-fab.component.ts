import {Component, EventEmitter, HostListener, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'ks-lib-ks-ingest-fab',
  templateUrl: './ks-ingest-fab.component.html',
  styleUrls: ['./ks-ingest-fab.component.scss']
})
export class KsIngestFabComponent implements OnInit {
  @Input() kcProjectId?: string;

  @Output() fabExpanded = new EventEmitter<boolean>();

  @Output() fabHovering = new EventEmitter<boolean>();

  hovering: boolean = false;

  @HostListener('mouseenter') onMouseEnter() {
    this.hovering = true;
    this.fabHovering.emit(this.hovering);
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.hovering = false;
    this.fabHovering.emit(this.hovering);
  }

  constructor() { }

  ngOnInit(): void {
  }

  fabExpand($event: MouseEvent) {
    this.fabExpanded.emit(true);
  }

  addKs() {

  }
}
