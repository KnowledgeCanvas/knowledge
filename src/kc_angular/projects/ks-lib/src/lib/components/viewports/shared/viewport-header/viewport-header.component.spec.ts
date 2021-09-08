import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewportHeaderComponent } from './viewport-header.component';

describe('ViewportHeaderComponent', () => {
  let component: ViewportHeaderComponent;
  let fixture: ComponentFixture<ViewportHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewportHeaderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewportHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
