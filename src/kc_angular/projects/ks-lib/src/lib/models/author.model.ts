/**
 Copyright 2021 Rob Royce

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

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
