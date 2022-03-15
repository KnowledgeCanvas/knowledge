export declare class KcExtensionServer {
    private __server?;
    private __PORT;
    constructor();
    receive(req: any, res: any): Promise<void>;
    start(): void;
}
