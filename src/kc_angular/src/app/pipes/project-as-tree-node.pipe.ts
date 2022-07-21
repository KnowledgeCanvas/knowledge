import {Pipe, PipeTransform} from '@angular/core';
import {TreeNode} from "primeng/api";
import {UUID} from "../../../../kc_shared/models/uuid.model";
import {ProjectTreeFactoryService} from "../services/factory-services/project-tree-factory.service";

@Pipe({
  name: 'projectAsTreeNode'
})
export class ProjectAsTreeNodePipe implements PipeTransform {

  constructor(private tree: ProjectTreeFactoryService) {}

  transform(id: UUID, treeNodes: TreeNode[]): TreeNode {
    return this.tree.findTreeNode(treeNodes, id.value) ?? {};
  }

}
