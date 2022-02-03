export interface WebsiteModel {
    url?: string;
    dateExtracted?: string;
    metadata?: WebsiteMetadataModel;
}
export interface WebsiteMetadataModel {
    title?: string;
    meta?: WebsiteMetaTagsModel[];
    icon?: any;
}
export interface WebsiteMetaTagsModel {
}
