import { UUID } from "./uuid";
export declare class TopicModel {
    id: UUID;
    name: string;
    description?: string;
    dateCreated: string;
    dateUpdated: string;
    constructor(id: UUID, name: string);
}
