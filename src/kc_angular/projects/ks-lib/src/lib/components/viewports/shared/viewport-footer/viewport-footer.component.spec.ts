import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewportFooterComponent } from './viewport-footer.component';

describe('ViewportFooterComponent', () => {
  let component: ViewportFooterComponent;
  let fixture: ComponentFixture<ViewportFooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewportFooterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewportFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
