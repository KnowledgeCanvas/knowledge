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

import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ProjectViewportComponent} from './project-viewport.component';
import {HttpClient} from "@angular/common/http";
import {Router} from "@angular/router";

describe('CanvasDetailsComponent', () => {
  let component: ProjectViewportComponent;
  let fixture: ComponentFixture<ProjectViewportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProjectViewportComponent],
      providers: [{
        provide: HttpClient,
        useValue: {}
      }, {
        provide: Router,
        useValue: {}
      }]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectViewportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
