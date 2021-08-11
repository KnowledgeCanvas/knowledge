import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CanvasSourceListComponent } from './canvas-source-list.component';

describe('CanvasSourceListComponent', () => {
  let component: CanvasSourceListComponent;
  let fixture: ComponentFixture<CanvasSourceListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CanvasSourceListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CanvasSourceListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
