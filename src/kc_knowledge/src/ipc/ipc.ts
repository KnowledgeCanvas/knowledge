/**
 Copyright 2022 Rob Royce

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

export class KcIpc {
    private send = window.api.send;
    private receive = window.api.receive;
    private receiveOnce = window.api.receiveOnce;

    constructor() {
    }

    getKs(): Promise<any> {
        return new Promise((res) => {
            this.receiveOnce('E2A:KnowledgeCanvas:GetSources', (response: any) => {
                console.log('Get response from Electron IPC in knowledge canvas: ', response);
                res(response);
            });
            console.log('Sending kc-get-ks-list...');
            this.send('A2E:KnowledgeCanvas:GetSources');
        })
    }

    closeModal() {
        console.log('Sending close modal signal...');
        this.send('A2E:KnowledgeCanvas:Close');
    }
}
