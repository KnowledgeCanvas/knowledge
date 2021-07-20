import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebsiteExtractionComponent } from './website-extraction.component';

describe('WebsiteExtractionComponent', () => {
  let component: WebsiteExtractionComponent;
  let fixture: ComponentFixture<WebsiteExtractionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WebsiteExtractionComponent ]
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
