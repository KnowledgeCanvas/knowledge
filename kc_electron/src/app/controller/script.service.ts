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

                console.log('Running script with name: ', name, ' and args: ', args);
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
