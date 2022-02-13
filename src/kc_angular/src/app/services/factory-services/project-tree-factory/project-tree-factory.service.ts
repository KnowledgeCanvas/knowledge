import { Injectable } from '@angular/core';
import {ProjectTreeNode} from "../../../models/project.tree.model";
import {TreeNode} from "primeng/api";
import {ProjectService} from "../project-service/project.service";

@Injectable({
  providedIn: 'root'
})
export class ProjectTreeFactoryService {

  constructor(private projectService: ProjectService) { }

  constructTreeNodes(projectNodes: ProjectTreeNode[], collapsed: boolean):  TreeNode[] {
    let treeNodes: TreeNode[] = [];

    for (let node of projectNodes) {
      let proj = this.projectService.getProject(node.id);

      // The collapsed flag means we do not want to use the ACTUAL project nodes, so make a deep copy
      if (collapsed) {
        proj = JSON.parse(JSON.stringify(proj));
      }

      let treeNode: TreeNode = {
        label: node.name,
        data: JSON.stringify(proj?.knowledgeSource),
        expanded: collapsed ? false : node.expanded,
        leaf: node.subprojects.length === 0,
        selectable: true,
        draggable: true,
        droppable: true,
        children: node.subprojects.length > 0 ? this.constructTreeNodes(node.subprojects, collapsed) : [],
        key: node.id
      };
      treeNodes.push(treeNode);
    }

    return treeNodes;
  }

  findTreeNode(treenodes: TreeNode[], id: string): TreeNode | undefined {
    let found = treenodes.find(n => n.key === id);
    if (found) {
      return found;
    }
    for (let node of treenodes) {
      if (node.children && node.children.length > 0) {
        found = this.findTreeNode(node.children, id);
        if (found) {
          return found;
        }
      }
    }
    return undefined;
  }
}
