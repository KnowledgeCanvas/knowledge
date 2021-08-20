import {ComponentFixture, TestBed} from '@angular/core/testing';

import {WebsiteExtractionFormComponent} from './website-extraction-form.component';
import {MatDialogRef} from "@angular/material/dialog";

describe('WebsiteExtractionFormComponent', () => {
  let component: WebsiteExtractionFormComponent;
  let fixture: ComponentFixture<WebsiteExtractionFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WebsiteExtractionFormComponent],
      providers: [
        {
          provide: MatDialogRef,
          useValue: {}
        }
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WebsiteExtractionFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
