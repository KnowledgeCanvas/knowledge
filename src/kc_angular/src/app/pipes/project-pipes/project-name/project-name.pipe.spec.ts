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

import { ProjectNamePipe } from './project-name.pipe';
import {ProjectTypePipe} from "../project-type/project-type.pipe";
import {ComponentFixture, TestBed} from "@angular/core/testing";
import {ProjectService} from "../../../services/factory-services/project-service/project.service";

describe('ProjectNamePipe', () => {
  let component: ProjectTypePipe;
  let fixture: ComponentFixture<ProjectTypePipe>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProjectTypePipe],
      providers: [ProjectService]
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectTypePipe);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('create an instance', () => {
    expect(component).toBeTruthy();
  });
});
