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

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebsiteExtractionComponent } from './website-extraction.component';
import {HttpClient} from "@angular/common/http";
import {MatDialogRef} from "@angular/material/dialog";

describe('WebsiteExtractionComponent', () => {
  let component: WebsiteExtractionComponent;
  let fixture: ComponentFixture<WebsiteExtractionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WebsiteExtractionComponent ],
      providers: [
        {
        provide: HttpClient,
        useValue: {}
      },
        {
          provide: MatDialogRef,
          useValue: {}
        }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WebsiteExtractionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
