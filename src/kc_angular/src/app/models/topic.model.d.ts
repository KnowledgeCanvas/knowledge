import { UuidModel } from "./uuid.model";
export declare class TopicModel {
    id: UuidModel;
    name: string;
    description?: string;
    dateCreated: string;
    dateUpdated: string;
    constructor(id: UuidModel, name: string);
}
