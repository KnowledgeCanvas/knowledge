import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FloatingActionButtonComponent} from './floating-action-button.component';
import {MatDialog} from "@angular/material/dialog";

describe('FloatingActionButtonComponent', () => {
  let component: FloatingActionButtonComponent;
  let fixture: ComponentFixture<FloatingActionButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FloatingActionButtonComponent],
      providers: [{
        provide: MatDialog,
        useValue: {}
      }]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FloatingActionButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
