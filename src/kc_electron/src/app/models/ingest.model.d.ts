export interface IngestSettingsModel {
    autoscan: boolean;
    interval?: number;
    autoscanLocation?: string;
    preserveTimestamps?: string;
    managed: boolean;
}
