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

import {Component, Input} from '@angular/core';
import {KnowledgeSource} from "../../../models/knowledge.source.model";
import {ObjectUtils} from "primeng/utils";

interface ExportType {
  name: string,
  value: string,
  export: (data: KnowledgeSource[]) => void
}

@Component({
  selector: 'app-ks-export',
  templateUrl: './ks-export.component.html',
  styleUrls: ['./ks-export.component.scss']
})
export class KsExportComponent {
  @Input() data: KnowledgeSource[] = [];

  exportDialogVisible: boolean = false;

  EXPORT_FILENAME = 'kc_export';

  EXPORT_SEPARATOR = ',';

  readonly EXPORT_COLUMNS: { field: string, header: string }[] = [
    {field: 'title', header: 'Title'},
    {field: 'id', header: 'Id'},
    {field: 'ingestType', header: 'Type'},
    {field: 'accessLink', header: 'Link'},
    {field: 'dateDue', header: 'Due Date'},
    {field: 'dateCreated', header: 'Created'},
    {field: 'dateAccessed', header: 'Accessed'},
    {field: 'dateModified', header: 'Modified'},
    {field: 'flagged', header: 'Important'},
    {field: 'associatedProject', header: 'Project'},
    {field: 'topics', header: 'Topics'},
    {field: 'description', header: 'Description'}
  ];

  selectedFeatures: string[] = this.EXPORT_COLUMNS.map(c => c.field);

  exportTypes: ExportType[] = [
    {
      name: 'JSON', value: '.json', export: (data: KnowledgeSource[]) => {
        const encoding = this.encodeJSON(data);
        this.createFile(encoding, 'text/json', 'utf-8');
      }
    },
    {
      name: 'CSV', value: '.csv', export: (data: KnowledgeSource[]) => {
        const encoding = this.encodeCSV(data)
        this.createFile(encoding, 'text/csv', 'utf-8');
      }
    },
    {
      name: 'TSV', value: '.tsv', export: (data: KnowledgeSource[]) => {
        const encoding = this.encodeTSV(data)
        this.createFile(encoding, 'text/tsv', 'utf-8');
      }
    }
  ];

  selectedExportType: string = '.json'

  constructor() {
  }

  createFile(encoding: string, type: string, charset: string) {
    let blob = new Blob([encoding], {
      type: `${type};charset=${charset};`
    });

    let link = document.createElement("a");
    link.style.display = 'none';
    document.body.appendChild(link);
    if (link.download !== undefined) {
      link.setAttribute('href', URL.createObjectURL(blob));
      link.setAttribute('download', this.EXPORT_FILENAME + this.selectedExportType);
      link.click();
    } else {
      encoding = `data:${type};charset=${charset}` + encoding;
      window.open(encodeURI(encoding));
    }
    document.body.removeChild(link);
  }

  export() {
    this.exportTypes.find(e => e.value === this.selectedExportType)?.export(this.data)
  }

  getExportHeader(column: any) {
    return column.header || column.field;
  }

  encodeJSON(data: KnowledgeSource[]): string {
    let encoded: any[] = []

    for (let ks of data) {
      let temp: any = {};
      const selectedColumns = this.EXPORT_COLUMNS.filter(c => this.selectedFeatures.includes(c.field))
      for (let column of selectedColumns) {
        let cellData;
        if (column.field === 'id' || column.field === 'associatedProject') {
          cellData = ObjectUtils.resolveFieldData(ks, column.field).value;
        } else {
          cellData = ObjectUtils.resolveFieldData(ks, column.field);
        }
        temp[column.field] = cellData;
      }
      encoded.push(temp);
    }

    return JSON.stringify(encoded);
  }

  encodeTSV(data: KnowledgeSource[]): string {
    return this.encodeSV(data, '\t');
  }

  encodeCSV(data: KnowledgeSource[]): string {
    return this.encodeSV(data, ',');
  }

  encodeSV(data: KnowledgeSource[], separator: string): string {
    let text = '';
    let columns = this.EXPORT_COLUMNS;

    //headers
    for (let i = 0; i < columns.length; i++) {
      let column = columns[i];
      text += '"' + this.getExportHeader(column) + '"';

      if (i < (columns.length - 1)) {
        text += separator;
      }
    }

    //body
    data.forEach((record) => {
      text += '\n';
      for (let i = 0; i < columns.length; i++) {
        let column = columns[i];

        let cellData;

        if (column.field === 'id' || column.field === 'associatedProject') {
          cellData = ObjectUtils.resolveFieldData(record, column.field).value;
        } else {
          cellData = ObjectUtils.resolveFieldData(record, column.field);
        }

        if (cellData != null) {
          cellData = String(cellData).replace(/"/g, '""');
        } else {
          cellData = '';
        }

        cellData = cellData.replace('\n', '');

        text += '"' + cellData + '"';

        if (i < (columns.length - 1)) {
          text += separator;
        }
      }
    });

    return text;
  }


}
