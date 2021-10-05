import {Component, EventEmitter, HostListener, Input, OnInit, Output} from '@angular/core';
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'ks-lib-ks-ingest-fab',
  templateUrl: './ks-ingest-fab.component.html',
  styleUrls: ['./ks-ingest-fab.component.scss']
})
export class KsIngestFabComponent implements OnInit {
  private nClicks = 0;

  hovering: boolean = false;

  visible: boolean = false;

  @Input() kcProjectId?: string;

  @Input() ksFabAnimate: boolean = true;

  @Input() ksFabActions: { icon: string, label: string, click: () => void }[] = [];

  @Output() ksFabExpanded = new EventEmitter<boolean>();

  @Output() ksFabHovering = new EventEmitter<boolean>();

  constructor(private snackbar: MatSnackBar) {
  }

  @HostListener('mouseenter') onMouseEnter() {
    this.hovering = true;
    this.visible = true;
    this.ksFabHovering.emit(this.hovering);
    this.ksFabExpanded.emit(true);
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.hovering = false;
    this.ksFabHovering.emit(this.hovering);
    setTimeout(() => {
      this.visible = false;
      this.ksFabExpanded.emit(false);
    }, 250);
  }

  ngOnInit(): void {
  }

  fabClicked() {
    this.nClicks += 1;
    if (this.nClicks === 8) {
      this.snackbar.open('Cut it out, I\'m trying to study over here!', 'Fine, I\'ll behave...');
    }
  }
}
