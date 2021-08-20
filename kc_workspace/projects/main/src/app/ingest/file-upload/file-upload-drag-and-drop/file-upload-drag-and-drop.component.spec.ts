import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FileUploadDragAndDropComponent} from './file-upload-drag-and-drop.component';
import {MatDialogRef} from "@angular/material/dialog";
import {HttpClient} from "@angular/common/http";

describe('FileUploadDragAndDropComponent', () => {
  let component: FileUploadDragAndDropComponent;
  let fixture: ComponentFixture<FileUploadDragAndDropComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FileUploadDragAndDropComponent],
      providers: [
        MatDialogRef,
        HttpClient
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FileUploadDragAndDropComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
