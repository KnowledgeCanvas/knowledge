import {Component, Input, OnInit} from '@angular/core';
import {KnowledgeSource} from "../../../models/knowledge.source.model";
import {KsCommandService} from "../../../services/command-services/ks-command/ks-command.service";

@Component({
  selector: 'app-ks-dataview',
  templateUrl: './ks-dataview.component.html',
  styleUrls: ['./ks-dataview.component.scss']
})
export class KsDataviewComponent implements OnInit {
  @Input() ksList!: KnowledgeSource[];

  constructor(private ksCommandService: KsCommandService) { }

  ngOnInit(): void {
  }

  onKsRemove($event: KnowledgeSource) {
    this.ksCommandService.remove([$event]);
  }

  onKsOpen($event: KnowledgeSource) {
    this.ksCommandService.open($event);
  }

  onKsPreview($event: KnowledgeSource) {
    this.ksCommandService.preview($event);
  }

  onKsDetail($event: KnowledgeSource) {
    this.ksCommandService.detail($event);
  }
}
