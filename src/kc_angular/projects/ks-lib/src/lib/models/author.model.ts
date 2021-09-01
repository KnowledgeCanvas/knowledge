import {UuidModel} from "./uuid.model";

export class AuthorModel {
  firstName?: string;
  lastName?: string;
  id?: UuidModel;

  constructor(firstName: string, lastName: string) {
    // TODO: replace this (uuid service should probably just request X ids and keep track of them internally)
    // window.api.receive("app-generate-uuid-results", (data: string[]) => {
    //   if (data && data[0])
    //     this.id = new UuidModel(data[0]);
    // });
    // window.api.send("app-generate-uuid", {quantity: 1});

    this.firstName = firstName;
    this.lastName = lastName;
  }
}
