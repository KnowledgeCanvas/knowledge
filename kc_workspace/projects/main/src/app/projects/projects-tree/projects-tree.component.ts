import {Component, OnInit} from '@angular/core';
import {MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree';
import {FlatTreeControl} from '@angular/cdk/tree';
import {ProjectTreeFlatNode, ProjectTreeNode} from "../../../../../shared/src/models/project.tree.model";
import {ProjectService} from "../../../../../shared/src/services/projects/project.service";
import {ProjectModel} from "../../../../../shared/src/models/project.model";
import {MatDialog} from '@angular/material/dialog';
import {ConfirmDialogService} from "../../../../../shared/src/services/confirm-dialog/confirm-dialog.service";
import {ProjectCreationDialogComponent} from "../project-creation-dialog/project-creation-dialog.component";

@Component({
  selector: 'app-projects-tree',
  templateUrl: './projects-tree.component.html',
  styleUrls: ['./projects-tree.component.scss']
})
export class ProjectsTreeComponent implements OnInit {
  activeId: string = '';
  activeProject: ProjectModel | null = null;
  flatToNestedMap = new Map<ProjectTreeFlatNode, ProjectTreeNode>();
  nestedToFlatMap = new Map<ProjectTreeNode, ProjectTreeFlatNode>();

  treeControl: FlatTreeControl<ProjectTreeFlatNode>;
  treeFlattener: MatTreeFlattener<ProjectTreeNode, ProjectTreeFlatNode>;
  dataSource: MatTreeFlatDataSource<ProjectTreeNode, ProjectTreeFlatNode>;

  constructor(private projectService: ProjectService,
              public matDialog: MatDialog,
              private dialogService: ConfirmDialogService) {
    this.treeFlattener = new MatTreeFlattener<ProjectTreeNode, ProjectTreeFlatNode>(
      this.transformer,
      this.getLevel,
      this.isExpandable,
      this.getChildren);
    this.treeControl = new FlatTreeControl<ProjectTreeFlatNode>(this.getLevel, this.isExpandable);
    this.dataSource = new MatTreeFlatDataSource<ProjectTreeNode, ProjectTreeFlatNode>(
      this.treeControl,
      this.treeFlattener);
  }

  subscribeToProjects(): void {
    this.projectService.allProjects.subscribe(data => {
      console.log('All projects: ', data);
      this.dataSource.data = data;
      this.treeControl.expandAll();
    });

    this.projectService.currentProject.subscribe(current => {
      this.activeProject = current;
      this.activeId = current.id.value;
    });
  }

  ngOnInit(): void {
    this.subscribeToProjects();
  }

  getLevel = (node: ProjectTreeFlatNode) => node.level;
  isExpandable = (node: ProjectTreeFlatNode) => node.expandable;
  getChildren = (node: ProjectTreeNode): ProjectTreeNode[] => node.subprojects;
  hasChild = (_: number, nodeData: ProjectTreeFlatNode) => nodeData.expandable;
  hasNoName = (_: number, nodeData: ProjectTreeFlatNode) => nodeData.name === '';

  transformer = (node: ProjectTreeNode, level: number) => {
    const existingNode = this.nestedToFlatMap.get(node);
    const flatNode: ProjectTreeFlatNode = existingNode && existingNode.name === node.name ? existingNode : {
      name: node.name,
      id: node.id,
      level,
      expandable: !!node.subprojects?.length
    };

    this.flatToNestedMap.set(flatNode, node);
    this.nestedToFlatMap.set(node, flatNode);
    return flatNode;
  }

  newProject(parentId?: string): void {
    if (parentId) {
      const dialogRef = this.matDialog.open(ProjectCreationDialogComponent, {
        data: parentId,
        width: '65%'
      });
      dialogRef.afterClosed().subscribe(result => {
        console.log('Project creation dialog closed with: ', result);
        if (result && result.id) {
          this.projectService.setCurrentProject(result.id);
        }
        this.matDialog.closeAll();
      }, error => {
        console.error(error);
        this.matDialog.closeAll();
      });
    } else {
      const dialogRef = this.matDialog.open(ProjectCreationDialogComponent, {
        width: '65%'
      });
      dialogRef.afterClosed().subscribe(result => {
        console.log('Project creation dialog closed with: ', result);
        if (result && result.id) {
          this.projectService.setCurrentProject(result.id);
        }
        this.matDialog.closeAll();
      }, error => {
        console.error(error);
        this.matDialog.closeAll();
      });
    }

  }

  selectProject(id: string): void {
    this.projectService.setCurrentProject(id);
  }

  delete(id: string): void {
    if (!id) {
      return;
    }

    const options = {
      title: 'Delete Project?',
      message: 'You will not be able to recover this project once it is deleted. All information and associated data' +
        ' will be unrecoverable. Continue?',
      cancelText: 'CANCEL',
      confirmText: 'YES, DELETE PROJECT'
    };
    this.dialogService.open(options);
    this.dialogService.confirmed().subscribe(confirmed => {
      if (confirmed) {
        console.log('Deletion confirmed...');

        this.projectService.deleteProject(id)
          .then(value => {
            console.log('Result of deletion: ', value);
          })
          .catch(reason => {
            console.error(reason);
          });
      }
    }, error => {
      console.error(error);
    });
  }

  // TODO: Keeping this here as a teplate for later
  // importAgent(parentId: string): void {
  //     this.ipcService.send('open-directory-dialog');
  //     this.ipcService.on('open-directory-dialog-reply', (event, response) => {
  //         this.projectService.importAgent(parentId, response.path).subscribe(result => {
  //             this.projectService.setCurrentProject(parentId);
  //         }, error => {
  //             console.error(error);
  //         });
  //     });
  // }

  refreshTree(): void {
    this.projectService.refreshTree();
  }
}
