import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {ProjectCreationDialogComponent} from './project-creation-dialog.component';
import {HttpClient} from "@angular/common/http";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

describe('ProjectCreationDialogComponent', () => {
  let component: ProjectCreationDialogComponent;
  let fixture: ComponentFixture<ProjectCreationDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ProjectCreationDialogComponent],
      providers: [
        {
          provide: HttpClient,
          useValue: {}
        },
        {
          provide: MatDialogRef,
          useValue: {}
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {}
        }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectCreationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
