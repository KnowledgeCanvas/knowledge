import {ComponentFixture, TestBed} from '@angular/core/testing';

import {KnowledgeSourceEditListComponent} from './knowledge-source-edit-list.component';
import {HttpClient} from "@angular/common/http";

describe('KnowledgeSourceViewComponent', () => {
  let component: KnowledgeSourceEditListComponent;
  let fixture: ComponentFixture<KnowledgeSourceEditListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KnowledgeSourceEditListComponent ],
      providers: [
        {
          provide: HttpClient,
          useValue: {}
        }
      ]

    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KnowledgeSourceEditListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
