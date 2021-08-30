import {UuidModel} from "./uuid.model";

export class TopicModel {
  public id: UuidModel;
  public name: string;
  public description?: string;
  public dateCreated: string;
  public dateUpdated: string;

  constructor(id: UuidModel, name: string) {
    this.id = id;
    this.name = name;
    this.dateCreated = Date();
    this.dateUpdated = Date();
  }
}
