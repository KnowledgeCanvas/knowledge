export interface ProcessResult {
    stdOut: string;
    stdErr: string;
    error?: any;
    code?: number;
}