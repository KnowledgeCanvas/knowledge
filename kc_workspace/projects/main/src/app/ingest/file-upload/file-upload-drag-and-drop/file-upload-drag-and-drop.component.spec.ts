import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileUploadDragAndDropComponent } from './file-upload-drag-and-drop.component';

describe('FileUploadDragAndDropComponent', () => {
  let component: FileUploadDragAndDropComponent;
  let fixture: ComponentFixture<FileUploadDragAndDropComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FileUploadDragAndDropComponent ]
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
