declare const share: any;
declare const ipcMain: any;
declare const app: any;
declare const path: any;
declare const BrowserWindow: any;
declare const KNOWLEDGE_ENTRY: string;
declare let kcKnowledgeWindow: typeof BrowserWindow | null;
declare let ipcHandshake: (ksList: []) => Promise<any>;
declare let getKnowledgeSourceList: any;
