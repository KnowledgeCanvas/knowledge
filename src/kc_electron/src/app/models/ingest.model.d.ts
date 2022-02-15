export interface IngestSettingsModel {
    autoscan: boolean;
    autoscanLocation?: string;
    interval?: number;
    managed: boolean;
    preserveTimestamps?: string;
    storageLocation?: string;
}
