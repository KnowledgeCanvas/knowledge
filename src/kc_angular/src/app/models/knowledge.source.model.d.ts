import { UuidModel } from "./uuid.model";
import { SearchModel } from "./google.search.results.model";
import { FileModel } from "./file.model";
import { WebsiteModel } from "./website.model";
import { AuthorModel } from "./author.model";
export declare type IngestType = 'google' | 'file' | 'website' | 'generic' | 'topic' | 'search' | 'note';
export declare type SourceReference = 'search' | 'list' | 'extract';
export declare type SourceType = 'article';
export declare class SourceModel {
    search: SearchModel | undefined;
    file: FileModel | undefined;
    website: WebsiteModel | undefined;
    constructor(file?: FileModel, search?: SearchModel, website?: WebsiteModel);
}
export declare class KnowledgeSourceReference {
    ingestType: IngestType;
    source: SourceModel;
    link: URL | string;
    constructor(ingestType: IngestType, source: SourceModel, link: URL | string);
}
export declare class KnowledgeSource {
    associatedProjects?: UuidModel[];
    authors?: AuthorModel[];
    dateCreated: Date;
    dateAccessed: Date;
    dateModified: Date;
    description?: string;
    fileItem?: FileModel;
    googleItem?: SearchModel;
    icon?: any;
    iconUrl?: string;
    id: UuidModel;
    ingestType: IngestType;
    snippet?: string;
    sourceRef?: SourceReference;
    title: string;
    topics?: string[];
    notes: KnowledgeSourceNotes;
    readonly accessLink: URL | string;
    readonly reference: KnowledgeSourceReference;
    constructor(title: string, id: UuidModel, ingestType: IngestType, reference: KnowledgeSourceReference);
}
export declare class KnowledgeSourceNotes {
    private content;
    dateCreated: Date;
    dateModified: Date;
    dateAccessed: Date;
    constructor();
    get text(): string;
    set text(content: string);
}
