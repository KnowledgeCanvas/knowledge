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
                    console.log('Project: ', project);
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
                            console.log('Adding ks to graph: ', ks);
                            ks.icon = localStorage.getItem(`icon-${ks.id.value}`);
                            let node = {
                                group: 'nodes',
                                data: {
                                    id: ks.id.value,
                                    label: ks.title,
                                    type: 'ks',
                                }, style: {'background-image': `url(${ks.icon})`}
                            }
                            let edge = {
                                groupe: 'edges',
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
        let projectsStr = localStorage.getItem('kc-projects');
        if (!projectsStr) {
            console.error('Unable to find projects in local storage...');
            return;
        }
        projectsStr = JSON.parse(projectsStr);
        if (!projectsStr) {
            console.error('Unable to parse projects...');
            return;
        }
        let projects = [];
        for (let pStr of projectsStr) {
            let p = localStorage.getItem(pStr);
            if (!p) {
                continue;
            }
            p = JSON.parse(p);
            if (!p) {
                continue;
            }
            projects.push(p);
        }
        return projects;
    }
}
