import {ComponentFixture, TestBed} from '@angular/core/testing';

import {KnowledgeSourceDropListComponent} from './knowledge-source-drop-list.component';
import {MatDialogModule, MatDialogRef} from "@angular/material/dialog";
import {HttpClient} from "@angular/common/http";

describe('CanvasSourceListComponent', () => {
  let component: KnowledgeSourceDropListComponent;
  let fixture: ComponentFixture<KnowledgeSourceDropListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [KnowledgeSourceDropListComponent],
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
    fixture = TestBed.createComponent(KnowledgeSourceDropListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
