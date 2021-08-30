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
