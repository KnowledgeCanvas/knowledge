import {Injectable} from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {KnowledgeSource} from "kc_knowledge/src/knowledge/knowledge-canvas";

@Injectable({
  providedIn: 'root'
})
export class KsCommandService {

  private _ksDetailEvent = new BehaviorSubject<KnowledgeSource | undefined>(undefined);
  ksDetailEvent = this._ksDetailEvent.asObservable();

  private _ksPreviewEvent = new BehaviorSubject<KnowledgeSource | undefined>(undefined);
  ksPreviewEvent = this._ksPreviewEvent.asObservable();

  private _ksOpenEvent = new BehaviorSubject<KnowledgeSource | undefined>(undefined);
  ksOpenEvent = this._ksOpenEvent.asObservable();

  private _ksRemoveEvent = new BehaviorSubject<KnowledgeSource[]>([]);
  ksRemoveEvent = this._ksRemoveEvent.asObservable();

  private _ksMoveEvent = new BehaviorSubject<KnowledgeSource[]>([]);
  ksMoveEvent = this._ksMoveEvent.asObservable();

  private _ksShareEvent = new BehaviorSubject<KnowledgeSource[]>([]);
  ksShareEvent = this._ksShareEvent.asObservable();

  private _ksCopyPathEvent = new BehaviorSubject<KnowledgeSource[]>([]);
  ksCopyPathEvent = this._ksCopyPathEvent.asObservable();

  private _ksCopyJSONEvent = new BehaviorSubject<KnowledgeSource[]>([]);
  ksCopyJSONEvent = this._ksCopyJSONEvent.asObservable();

  private _ksUpdateEvent = new BehaviorSubject<KnowledgeSource[]>([]);
  ksUpdateEvent = this._ksUpdateEvent.asObservable();

  private _ksShowInFilesEvent = new BehaviorSubject<KnowledgeSource>([]);
  ksShowInFilesEvent = this._ksShowInFilesEvent.asObservable();

  constructor() {
  }

  update(ksList: KnowledgeSource[]) {
    this._ksUpdateEvent.next(ksList);
  }

  remove(ksList: KnowledgeSource[]) {
    this._ksRemoveEvent.next(ksList);
  }

  move(ksList: KnowledgeSource[]) {
    this._ksMoveEvent.next(ksList);
  }

  preview(ks: KnowledgeSource) {
    this._ksPreviewEvent.next(ks);
  }

  detail(ks: KnowledgeSource) {
    this._ksDetailEvent.next(ks);
  }

  share(ksList: KnowledgeSource[]) {
    this._ksShareEvent.next(ksList);
  }

  open(ks: KnowledgeSource) {
    this._ksOpenEvent.next(ks);
  }

  copyPath(ksList: KnowledgeSource[]) {
    this._ksCopyPathEvent.next(ksList);
  }

  copyJSON(ksList: KnowledgeSource[]) {
    this._ksCopyJSONEvent.next(ksList);
  }

  showInFiles(ks: KnowledgeSource) {
    this._ksShowInFilesEvent.next(ks);
  }
}
