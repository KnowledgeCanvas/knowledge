import { WebsiteModel } from "./website.model";
import { AuthorModel } from "../../../../kc_shared/models/author.model";
import { FileSourceModel } from "../../../../kc_shared/models/file.source.model";
import { UUID } from "./uuid";
export declare type IngestType = 'google' | 'file' | 'website' | 'generic' | 'topic' | 'search' | 'note' | 'message';
export declare type SourceType = 'article';
export declare class SourceModel {
    file: FileSourceModel | undefined;
    website: WebsiteModel | undefined;
    constructor(file?: FileSourceModel, website?: WebsiteModel);
}
export declare class KnowledgeSourceReference {
    ingestType: IngestType;
    source: SourceModel;
    link: URL | string;
    constructor(ingestType: IngestType, source: SourceModel, link: URL | string);
}
export declare type KnowledgeSourceEvent = {
    date: Date;
    label: string;
    hash?: string;
    primeIcon?: string;
    imageIcon?: string;
    iconText?: string;
};
export declare class KnowledgeSource {
    associatedProject: UUID;
    authors: AuthorModel[];
    dateDue?: Date;
    dateCheckpoint: Date[];
    dateCreated: Date;
    dateAccessed: Date[];
    dateModified: Date[];
    description: string;
    events?: KnowledgeSourceEvent[];
    icon?: any;
    iconUrl?: string;
    id: UUID;
    ingestType: IngestType;
    snippet?: string;
    rawText?: string;
    flagged?: boolean;
    title: string;
    topics?: string[];
    note: KnowledgeSourceNote;
    accessLink: URL | string;
    readonly reference: KnowledgeSourceReference;
    importMethod?: 'autoscan' | 'dnd' | 'extension' | 'manual';
    constructor(title: string, id: UUID, ingestType: IngestType, reference: KnowledgeSourceReference);
}
export declare class KnowledgeSourceNote {
    text: string;
    dateCreated: string;
    dateModified: string;
    dateAccessed: string;
    constructor(text?: string);
    static blank(): KnowledgeSourceNote;
}
export declare class KnowledgeSourceMarkup {
}
