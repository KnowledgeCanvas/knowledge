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

import cytoscape from 'cytoscape';
import edgehandles from 'cytoscape-edgehandles';
import {KnowledgeCanvas} from "./knowledge/knowledge-canvas";
import {KcIpc} from "./ipc/ipc";

cytoscape.use(edgehandles);

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

    const layoutBtnCose = document.getElementById('layout-btn-cose');
    if (layoutBtnCose)
        layoutBtnCose.addEventListener('click', () => {
            kc.layout('cose');
        });

    const closeBtn = document.getElementById('close-btn');
    if (closeBtn)
        closeBtn.addEventListener('click', () => {
            console.log('Got click to close modal...');
            ipc.closeModal();
        });
}

main();

declare global {
    interface Window {
        api?: any;
    }
}
