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

import {Options, PythonShell} from "python-shell";

const RET_OK = 0;
const RET_FAIL = -1;
let GLOBAL_ERROR = '';

class ScriptService {
    constructor() {
    }

    runPythonScript(name: string, args: any): Promise<string> {
        return new Promise((resolve, reject) => {
            const scriptArgs: [string] = [args.searchTerm];

            if (args.hasOwnProperty('searchTerm')) {
                let options: Options = {
                    mode: 'text',
                    scriptPath: 'kc_search/src/',
                    args: scriptArgs
                }

                console.warn('Running script with name: ', name, ' and args: ', args);
                PythonShell.run('search.py', options, (err, results) => {
                    if (err) {
                        console.error('PythonShell [run] returned an error: ', err);
                        reject(err);
                    } else {
                        if (results) {
                            resolve(results.toString());
                        } else {
                            resolve('');
                        }


                    }
                })
            }
        })

    }
}

let scriptService = new ScriptService();
module.exports = scriptService;
