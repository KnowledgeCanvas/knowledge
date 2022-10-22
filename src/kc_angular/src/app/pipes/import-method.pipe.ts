import {Pipe, PipeTransform} from '@angular/core';
import {ImportMethod} from "../../../../kc_shared/models/knowledge.source.model";

@Pipe({
  name: 'importMethod'
})
export class ImportMethodPipe implements PipeTransform {

  transform(value?: ImportMethod): unknown {
    if (!value) {
      return '';
    }
    switch (value) {
      case "autoscan":
        return 'Autoscan';
      case "dnd":
        return 'Drag/Drop';
      case "extension":
        return 'Browser Extension';
      case "manual":
        return 'Manual';
      case "example":
        return 'Example';
      case "recommend":
        return "Recommended"
      default:
        return ''
    }
  }

}
