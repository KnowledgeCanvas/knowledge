import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KnowledgeSourceImportDialogComponent } from './knowledge-source-import-dialog.component';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {HttpClient} from "@angular/common/http";

describe('CanvasImportComponent', () => {
  let component: KnowledgeSourceImportDialogComponent;
  let fixture: ComponentFixture<KnowledgeSourceImportDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KnowledgeSourceImportDialogComponent ],
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
    fixture = TestBed.createComponent(KnowledgeSourceImportDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
