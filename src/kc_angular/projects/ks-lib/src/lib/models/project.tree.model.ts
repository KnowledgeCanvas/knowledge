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
    this.root.subprojects.forEach(((value, index, array) => {
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

  remove(node: ProjectTreeNode, current: ProjectTreeNode): void {
    console.error('Remove not implemented...');
    // current.subprojects.forEach(((value, index, array) => {
    //     if (value.id === node.id) {
    //         current.subprojects.splice(index, 1);
    //     } else {
    //         this.remove(node, value);
    //     }
    // }));
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
