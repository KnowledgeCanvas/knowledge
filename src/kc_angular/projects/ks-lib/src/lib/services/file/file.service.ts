import {Injectable} from '@angular/core';
import {UuidService} from "../uuid/uuid.service";
import {BehaviorSubject} from "rxjs";
import {FileModel} from "../../../../../shared/src/models/file.model";
import {KnowledgeSource} from "../../../../../shared/src/models/knowledge.source.model";

@Injectable({
  providedIn: 'root'
})
export class FileService {
  private files = new BehaviorSubject<FileModel[]>([]);
  public fileList = this.files.asObservable();

  constructor(private uuidService: UuidService) {
    let files = window.localStorage.getItem('kc-files');
    if (files)
      this.files.next(JSON.parse(files));
  }

  // async uploadFile(files: File[], projectId?: string) {
  //   console.log('Upload file with projectId: ', projectId);
  //   let uuids: UuidModel[] = [];
  //   uuids = await this.uuidService.generate(files.length).then(uuids => uuids);
  //
  //   let fileModels: FileModel[] = [];
  //   for (let file of files) {
  //     let f: FileModel = new FileModel(file.name, file.size, (file as any).path);
  //     fileModels.push(f);
  //   }
  //   this.files.next([...this.files.value, ...fileModels]);
  //   let fileString = JSON.stringify(this.files.value);
  //   window.localStorage.setItem('kc-files', fileString);
  //
  //   let ksList: KnowledgeSourceModel[] = [];
  //   for (let i = 0; i < files.length; i++) {
  //     console.log('Files[i]: ', fileModels[i]);
  //     let ks = new KnowledgeSourceModel(files[i].name, {value: ''}, 'file');
  //     ks.icon = 'file.ico';
  //     ks.fileItem = fileModels[i];
  //     ks.associatedProjects = projectId ? [{value: projectId}] : []
  //     ks.topics = [];
  //     ks.id = uuids[i];
  //     ksList.push(ks);
  //   }
  //
  //   let sources = window.localStorage.getItem('kc-knowledge-sources');
  //   if (sources) {
  //     let parsed = JSON.parse(sources);
  //     if (parsed) {
  //       ksList = [...ksList, ...parsed]
  //     }
  //   }
  //
  //
  //   let ksString = JSON.stringify(ksList);
  //   window.localStorage.setItem('kc-knowledge-sources', ksString);
  // }

  getFiles() {
    let files = window.localStorage.getItem('kc-files');
    if (files)
      this.files.next(JSON.parse(files));
    return this.files.value;
  }

  list(): Promise<KnowledgeSource[]> {
    return new Promise<any>((resolve) => {
      let list = window.localStorage.getItem('kc-knowledge-sources')
      if (list) {
        let files = JSON.parse(list);
        resolve(files);
      }
    });
  }

}
