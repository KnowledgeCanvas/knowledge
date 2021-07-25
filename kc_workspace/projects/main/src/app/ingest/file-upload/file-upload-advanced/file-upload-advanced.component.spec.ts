import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileUploadAdvancedComponent } from './file-upload-advanced.component';

describe('FileUploadAdvancedComponent', () => {
  let component: FileUploadAdvancedComponent;
  let fixture: ComponentFixture<FileUploadAdvancedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FileUploadAdvancedComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FileUploadAdvancedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
