import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CanvasImportComponent } from './canvas-import.component';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {HttpClient} from "@angular/common/http";

describe('CanvasImportComponent', () => {
  let component: CanvasImportComponent;
  let fixture: ComponentFixture<CanvasImportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CanvasImportComponent ],
      providers: [
        HttpClient,
        {
          provide: MAT_DIALOG_DATA,
          useValue: {}
        }
      ]
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
