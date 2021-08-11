import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CanvasImportComponent } from './canvas-import.component';

describe('CanvasImportComponent', () => {
  let component: CanvasImportComponent;
  let fixture: ComponentFixture<CanvasImportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CanvasImportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CanvasImportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
