import {ComponentFixture, TestBed} from '@angular/core/testing';

import {WebsiteExtractionAdvancedComponent} from './website-extraction-advanced.component';

describe('WebsiteExtractionAdvancedComponent', () => {
  let component: WebsiteExtractionAdvancedComponent;
  let fixture: ComponentFixture<WebsiteExtractionAdvancedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WebsiteExtractionAdvancedComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WebsiteExtractionAdvancedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
