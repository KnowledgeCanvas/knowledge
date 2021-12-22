export declare class KcIpc {
    private send;
    private receive;
    private receiveOnce;
    constructor();
    getKs(): Promise<any>;
    closeModal(): void;
}
