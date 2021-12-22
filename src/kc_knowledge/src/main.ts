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

import cytoscape, {CytoscapeOptions, LayoutOptions} from 'cytoscape';
import edgehandles, {EdgeHandlesInstance, EdgeHandlesOptions} from 'cytoscape-edgehandles';
cytoscape.use(edgehandles);
import {KnowledgeCanvas, KnowledgeSource} from "./knowledge/knowledge-canvas";
import {KcIpc} from "./ipc/ipc";

function main() {
    let ipc = new KcIpc();
    let kc: KnowledgeCanvas = new KnowledgeCanvas();

    const layoutBtn = document.getElementById('layout-btn');
    if (layoutBtn)
        layoutBtn.addEventListener('click', () => {
            kc.layout('circle');
        });

    const layoutBtnDag = document.getElementById('layout-btn-dag');
    if (layoutBtnDag)
        layoutBtnDag.addEventListener('click', () => {
            kc.layout('dagre');
        });

    const closeBtn = document.getElementById('close-btn');
    if (closeBtn)
        closeBtn.addEventListener('click', () => {
            console.log('Got click to close modal...');
            ipc.closeModal();
        });

    setTimeout(() => {
        ipc.getKs().then((ksList: {ksList: KnowledgeSource[]}) => {
            console.log('Got KS List: ', ksList);
            let data: any[] = [];

            for (let ks of ksList.ksList) {
                console.log('Ks icon: ', ks.icon);
                let icon = ks.icon.changingThisBreaksApplicationSecurity ? ks.icon.changingThisBreaksApplicationSecurity : ks.icon;
                let label = ks.title;
                let node = {
                    data: {id: ks.id.value, label: label},
                    style: {'background-image': `url(${ks.icon.changingThisBreaksApplicationSecurity})`}
                }
                data.push(node);
            }

            kc.reset(data);

            console.log('Reset cytoscape with data: ', data);

            kc.layout();
        });
    }, 1000);
}

main();

declare global {
    interface Window {
        api?: any;
    }
}
