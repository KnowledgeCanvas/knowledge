import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FileUploadComponent} from './file-upload.component';
import {FormBuilder} from "@angular/forms";
import {HttpClient} from "@angular/common/http";

describe('FileUploadComponent', () => {
  let component: FileUploadComponent;
  let fixture: ComponentFixture<FileUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FileUploadComponent],
      providers: [
        {
          provide: FormBuilder,
          useValue: {}
        },
        {
          provide: HttpClient,
          useValue: {}
        }
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FileUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
