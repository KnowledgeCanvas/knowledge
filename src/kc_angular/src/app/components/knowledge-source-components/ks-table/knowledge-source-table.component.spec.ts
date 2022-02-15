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

import {ComponentFixture, TestBed} from '@angular/core/testing';

import {KnowledgeSourceTableComponent} from './knowledge-source-table.component';
import {HttpClient} from "@angular/common/http";

describe('KnowledgeSourceViewComponent', () => {
  let component: KnowledgeSourceTableComponent;
  let fixture: ComponentFixture<KnowledgeSourceTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KnowledgeSourceTableComponent ],
      providers: [
        {
          provide: HttpClient,
          useValue: {}
        }
      ]

    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KnowledgeSourceTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
