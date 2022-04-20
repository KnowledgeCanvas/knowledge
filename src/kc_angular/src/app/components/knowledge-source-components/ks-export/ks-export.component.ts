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

@Component({
  selector: 'app-ks-export',
  templateUrl: './ks-export.component.html',
  styleUrls: ['./ks-export.component.scss']
})
export class KsExportComponent {
  @Input() data: KnowledgeSource[] = [];

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
    {field: 'description', header: 'Description'},
    {field: 'reference.source.website.metadata.meta', header: 'Meta'}
  ];

  constructor() {
  }

  getExportHeader(column: any) {
    return column.header || column.field;
  }

  onClick() {
    let data;
    let csv = '';
    let columns = this.EXPORT_COLUMNS;

    data = this.data;

    //headers
    for (let i = 0; i < columns.length; i++) {
      let column = columns[i];
      csv += '"' + this.getExportHeader(column) + '"';

      if (i < (columns.length - 1)) {
        csv += this.EXPORT_SEPARATOR;
      }
    }

    //body
    data.forEach((record) => {
      csv += '\n';
      for (let i = 0; i < columns.length; i++) {
        let column = columns[i];

        let cellData;

        if (column.field === 'id' || column.field === 'associatedProject') {
          cellData = ObjectUtils.resolveFieldData(record, column.field).value;
        }

        else if (column.field === 'reference.source.website.metadata.meta') {
          let metadata = ObjectUtils.resolveFieldData(record, column.field);
          cellData = '';

          let metalist = [];

          if (metadata && metadata.length) {
            for (let meta of metadata) {
              if (meta) {
                metalist.push(JSON.stringify(meta)
                  .replace('\n', '')
                  .replace(', ', ',')
                  .replace(' ,', ',')
                  .replace(' , ', ',')
                );
              }
            }
            cellData = metalist.join(',');
          } else {
            cellData = ''
          }
        }

        else {
          cellData = ObjectUtils.resolveFieldData(record, column.field);
        }

        if (cellData != null) {
          cellData = String(cellData).replace(/"/g, '""');
        } else {
          cellData = '';
        }

        cellData = cellData.replace('\n', '');

        csv += '"' + cellData + '"';

        if (i < (columns.length - 1)) {
          csv += this.EXPORT_SEPARATOR;
        }
      }
    });

    let blob = new Blob([csv], {
      type: 'text/csv;charset=utf-8;'
    });

    let link = document.createElement("a");
    link.style.display = 'none';
    document.body.appendChild(link);
    if (link.download !== undefined) {
      link.setAttribute('href', URL.createObjectURL(blob));
      link.setAttribute('download', this.EXPORT_FILENAME + '.csv');
      link.click();
    } else {
      csv = 'data:text/csv;charset=utf-8,' + csv;
      window.open(encodeURI(csv));
    }
    document.body.removeChild(link);
  }
}
