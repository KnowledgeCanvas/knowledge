import {Component, OnInit, ViewChild} from '@angular/core';
import {MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree';
import {FlatTreeControl} from '@angular/cdk/tree';
import {ProjectTreeFlatNode, ProjectTreeNode} from "projects/ks-lib/src/lib/models/project.tree.model";
import {ProjectIdentifiers, ProjectService} from "../../../../../ks-lib/src/lib/services/projects/project.service";
import {ProjectModel} from "projects/ks-lib/src/lib/models/project.model";
import {MatDialog} from '@angular/material/dialog';
import {KcDialogRequest, KcDialogService} from "../../../../../ks-lib/src/lib/services/dialog/kc-dialog.service";
import {ProjectCreationDialogComponent} from "../project-creation-dialog/project-creation-dialog.component";
import {MatMenuTrigger} from "@angular/material/menu";

@Component({
  selector: 'app-projects-tree',
  templateUrl: './projects-tree.component.html',
  styleUrls: ['./projects-tree.component.scss']
})
export class ProjectsTreeComponent implements OnInit {
  @ViewChild(MatMenuTrigger)
  contextMenu!: MatMenuTrigger;
  contextMenuPosition = {x: '0px', y: '0px'};
  contextTriggerId: string | undefined = undefined;
  treePadding: number = 16;
  activeId: string = '';
  activeProject: ProjectModel | null = null;
  flatToNestedMap = new Map<ProjectTreeFlatNode, ProjectTreeNode>();
  nestedToFlatMap = new Map<ProjectTreeNode, ProjectTreeFlatNode>();
  treeControl: FlatTreeControl<ProjectTreeFlatNode>;
  treeFlattener: MatTreeFlattener<ProjectTreeNode, ProjectTreeFlatNode>;
  dataSource: MatTreeFlatDataSource<ProjectTreeNode, ProjectTreeFlatNode>;

  constructor(private dialogService: KcDialogService,
              private projectService: ProjectService,
              public matDialog: MatDialog) {
    this.treeFlattener = new MatTreeFlattener<ProjectTreeNode, ProjectTreeFlatNode>(this.transformer, this.getLevel, this.isExpandable, this.getChildren);
    this.treeControl = new FlatTreeControl<ProjectTreeFlatNode>(this.getLevel, this.isExpandable);
    this.dataSource = new MatTreeFlatDataSource<ProjectTreeNode, ProjectTreeFlatNode>(this.treeControl, this.treeFlattener);

    this.projectService.allProjects.subscribe((projectNodes: ProjectTreeNode[]) => {
      this.dataSource.data = projectNodes;
      let flattenedNodes = this.treeFlattener.flattenNodes(projectNodes);
      for (let node of flattenedNodes) {
        let project = this.projectService.getProject(node.id);
        if (project && project.expanded) {
          this.treeControl.expand(node);
        }
      }
    });

    this.projectService.currentProject.subscribe(current => {
      this.activeProject = current;
      this.activeId = current.id.value;
    });
  }

  getLevel = (node: ProjectTreeFlatNode) => node.level;

  isExpandable = (node: ProjectTreeFlatNode) => node.expandable;

  getChildren = (node: ProjectTreeNode): ProjectTreeNode[] => node.subprojects;

  hasChild = (_: number, nodeData: ProjectTreeFlatNode) => nodeData.expandable;

  hasNoName = (_: number, nodeData: ProjectTreeFlatNode) => nodeData.name === '';

  subscribeToProjects(): void {
  }

  ngOnInit(): void {
    // this.subscribeToProjects();
  }

  transformer = (node: ProjectTreeNode, level: number) => {
    const existingNode = this.nestedToFlatMap.get(node);
    const flatNode: ProjectTreeFlatNode = existingNode && existingNode.name === node.name ? existingNode : {
      name: node.name,
      id: node.id,
      expanded: node.expanded,
      level,
      expandable: !!node.subprojects?.length
    };

    this.flatToNestedMap.set(flatNode, node);
    this.nestedToFlatMap.set(node, flatNode);
    return flatNode;
  }


  toggleNode(node: any) {
    node.expanded = this.treeControl.isExpanded(node);
    let project = this.projectService.getProject(node.id);
    if (project) {
      project.expanded = node.expanded;
      this.projectService.updateProject({id: project.id});
    }
  }

  selectProject(id: string): void {
    this.projectService.setCurrentProject(id);
  }

  delete(): void {
    if (!this.contextTriggerId) {
      return;
    }

    let id = this.contextTriggerId;
    this.contextTriggerId = undefined;

    const project = this.projectService.getProject(id);
    if (!project) {
      console.error('Error attempting to find project with ID: ', id);
      return;
    }

    let list: ProjectIdentifiers[] = [];
    if (project && project.subprojects && project.subprojects.length > 0)
      list = this.projectService.getSubTree(id);
    else
      list = [{id: project.id.value, title: project.name}];

    let message = 'Deleting a project will also delete all of its sub-projects.\
    Once you delete a project, you will not be able to recover it or any of its\
    associated data. Would you like to continue?'

    const options: KcDialogRequest = {
      title: 'Delete Project?',
      message: message,
      cancelButtonText: 'Cancel',
      actionButtonText: 'Delete Permanently',
      listToDisplay: list,
      actionToTake: 'delete'
    };

    this.dialogService.open(options);

    this.dialogService.confirmed().subscribe(confirmed => {
      if (confirmed && id) {
        this.projectService.deleteProject(id);
      }
    }, error => {
      console.error(error);
    });
  }

  newProject(parentId?: string): void {
    if (this.contextTriggerId) {
      parentId = this.contextTriggerId;
      this.contextTriggerId = undefined;
    }

    const dialogRef = this.matDialog.open(ProjectCreationDialogComponent, {
      data: parentId,
      width: '65%'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.id) {
        this.projectService.setCurrentProject(result.id);
      }
      this.matDialog.closeAll();
    }, error => {
      console.error(error);
      this.matDialog.closeAll();
    });
  }

  expandTree() {
    this.treeControl.expandAll();
    this.projectService.setAllExpanded(true);
  }

  collapseTree() {
    this.treeControl.collapseAll();
    this.projectService.setAllExpanded(false);
  }

  filter() {
    console.error('Filter not implemented yet!');
  }

  focus() {
    console.error('Focus not implemented yet!');
  }

  onContextMenu(event: MouseEvent, id: string) {
    event.preventDefault();
    this.contextMenuPosition.x = event.clientX + 'px';
    this.contextMenuPosition.y = event.clientY + 'px';
    if (this.contextMenu) {
      this.contextMenu.menuData = {'item': id};
      this.contextMenu.menu.focusFirstItem('mouse');
      this.contextMenu.openMenu();
    }
    this.contextTriggerId = id;
  }

  moveProject() {

  }
}
