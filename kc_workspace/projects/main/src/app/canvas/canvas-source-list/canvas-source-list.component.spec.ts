import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CanvasSourceListComponent} from './canvas-source-list.component';
import {MatDialogModule, MatDialogRef} from "@angular/material/dialog";
import {HttpClient} from "@angular/common/http";

describe('CanvasSourceListComponent', () => {
  let component: CanvasSourceListComponent;
  let fixture: ComponentFixture<CanvasSourceListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CanvasSourceListComponent],
      imports: [
        MatDialogModule
      ],
      providers: [
        {
          provide: MatDialogRef,
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
    fixture = TestBed.createComponent(CanvasSourceListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
