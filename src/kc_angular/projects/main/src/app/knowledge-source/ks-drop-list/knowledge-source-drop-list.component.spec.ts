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

import {KnowledgeSourceDropListComponent} from './knowledge-source-drop-list.component';
import {MatDialogModule, MatDialogRef} from "@angular/material/dialog";
import {HttpClient} from "@angular/common/http";

describe('CanvasSourceListComponent', () => {
  let component: KnowledgeSourceDropListComponent;
  let fixture: ComponentFixture<KnowledgeSourceDropListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [KnowledgeSourceDropListComponent],
      imports: [
        MatDialogModule
      ],
      providers: [
        {
          provide: MatDialogRef,
          useValue: {}
        },
        {
          provide: HttpClient,
          useValue: {}
        }
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KnowledgeSourceDropListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
