import { UuidModel } from "./uuid.model";
export interface AuthorModel {
    firstName: string;
    lastName: string;
    id: UuidModel;
}
