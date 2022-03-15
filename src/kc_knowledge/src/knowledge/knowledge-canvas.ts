import {CytoscapeOptions} from "cytoscape";
import {CytoscapeModel} from "./cytoscape.model";

export type KnowledgeSource = any;

export class KnowledgeCanvas {
    private cyContainer: HTMLElement | null = document.getElementById('cy');
    private cyModel: CytoscapeModel;

    constructor(options?: CytoscapeOptions) {
        this.cyModel = new CytoscapeModel(this.cyContainer, options);
        this.cyModel.reset(null);
        this.getAllProjects()
            .then((projects) => {
                if (!projects) {
                    return;
                }
                let data: any[] = [];

                for (let project of projects) {
                    let label = (project as any).name;
                    let node = {
                        data: {
                            id: (project as any).id.value,
                            label: label, type: 'project'
                        }
                    }
                    data.push(node);
                    if ((project as any).subprojects) {
                        for (let sub of (project as any).subprojects) {
                            let edge = {
                                group: 'edges',
                                data: {
                                    id: `${(project as any).id.value}-${sub}`,
                                    source: `${(project as any).id.value}`,
                                    target: `${sub}`
                                }
                            }
                            data.push(edge);
                        }
                    }

                    if ((project as any).knowledgeSource) {
                        for (let ks of (project as any).knowledgeSource) {
                            ks.icon = localStorage.getItem(`icon-${ks.id.value}`);
                            let node = {
                                group: 'nodes',
                                data: {
                                    id: ks.id.value,
                                    label: ks.title,
                                    type: 'ks',
                                }, style: ks.icon ? {'background-image': `url(${ks.icon})`} : {'background-color': 'grey'}
                            }
                            let edge = {
                                group: 'edges',
                                data: {
                                    id: `${(project as any).id.value}-${ks.id.value}`,
                                    source: (project as any).id.value,
                                    target: ks.id.value
                                }
                            }
                            data.push(node);
                            data.push(edge);
                        }
                    }

                }

                this.cyModel.reset(data);
                this.cyModel.layout();
            });
    }

    layout(method: string) {
        this.cyModel.layout(method);
    }

    private async getAllProjects() {
        const currentProject = localStorage.getItem('current-project');
        if (!currentProject) {
            console.warn('KnowledgeCanvas.getAllProjects() | Invalid current-project: ', currentProject);
            return;
        }

        const project = localStorage.getItem(currentProject);
        if (!project) {
            return;
        }

        let root = JSON.parse(project);
        if (!root) {
            console.warn('KnowledgeCanvas.getAllProjects() | Invalid root: ', root);
            return;
        }

        return this.getTree(root);
    }

    private getTree(project: string | any): any[] {
        if (!project) {
            console.error('KnowledgeCanvas.getTree(project) | Invalid project: ', project)
            return [];
        }

        if (typeof project === 'string') {
            let pStr = localStorage.getItem(project);
            if (!pStr) {
                return [];
            }

            let p = JSON.parse(pStr);
            if (!pStr) {
                return [];
            } else {
                project = p;
            }
        }

        let tree = [project];
        if (!project.subprojects) {
            return tree;
        }
        for (let subProject of project.subprojects) {
            tree = tree.concat(this.getTree(subProject));
        }

        return tree;
    }

    private getRoot(id: string): any {
        let projectStr = localStorage.getItem(id);
        if (!projectStr) {
            console.warn('KnowledgeCanvas.getRoot(id) | Invalid project string: ', projectStr, ' for ID: ', id);
            return;
        }

        let project = JSON.parse(projectStr);
        if (!project) {
            console.warn('KnowledgeCanvas.getRoot(id) | Invalid JSON parse of project: ', project);
            return;
        }


        if (project.parentId?.value) {
            if (project.parentId.value === '') {
                return project;
            }
            return this.getRoot(project.parentId.value);
        } else {
            return project;
        }
    }


}
