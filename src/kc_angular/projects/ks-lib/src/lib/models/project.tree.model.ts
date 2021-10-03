/**
 Copyright 2021 Rob Royce

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

export class ProjectTreeNode {
  name: string;
  id: string;
  type: string;
  expanded?: boolean = false;
  subprojects: ProjectTreeNode[]; // TODO: this should be a set, not array

  constructor(name?: string, id?: string, type?: string, subprojects?: ProjectTreeNode[]) {
    this.name = name ? name : '';
    this.id = id ? id : '';
    this.type = type ? type : '';
    this.subprojects = subprojects ? subprojects : [];
  }

  public addSubProject(sub: ProjectTreeNode): void {
    this.subprojects.push(sub);
  }
}

export class ProjectTree {
  root: ProjectTreeNode;

  constructor() {
    this.root = new ProjectTreeNode('root', '0', 'root', []);
  }

  asArray(): ProjectTreeNode[] {
    const arr: ProjectTreeNode[] = [];
    this.root.subprojects.forEach(((value) => {
      arr.push(value);
    }));
    return arr;
  }

  add(node: ProjectTreeNode, parentId?: string): void {
    if (parentId) {
      this.addChild(node, parentId, this.root);
    } else {
      this.root.addSubProject(node);
    }
  }

  find(id: string, node?: ProjectTreeNode): ProjectTreeNode | null {
    if (!node) {
      node = this.root;
    }

    if (node.id === id) {
      return node;
    } else {
      for (const sub of node.subprojects) {
        const found = this.find(id, sub);
        if (found) {
          return found;
        }
      }
      return null;
    }
  }

  private addChild(node: ProjectTreeNode, parentId: string, current: ProjectTreeNode): void {
    if (current.id === parentId) {
      current.subprojects.push(node);
    } else {
      for (const sub of current.subprojects) {
        this.addChild(node, parentId, sub);
      }
    }
  }
}

export interface ProjectTreeFlatNode {
  name: string;
  id: string;
  level: number;
  expandable: boolean;
  expanded?: boolean;
}
