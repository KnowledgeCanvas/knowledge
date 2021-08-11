import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CanvasDetailsOverviewComponent } from './canvas-details-overview.component';

describe('CanvasDetailsOverviewComponent', () => {
  let component: CanvasDetailsOverviewComponent;
  let fixture: ComponentFixture<CanvasDetailsOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CanvasDetailsOverviewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CanvasDetailsOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
