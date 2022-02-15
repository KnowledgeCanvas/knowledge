/**
 Copyright 2022 Rob Royce

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
