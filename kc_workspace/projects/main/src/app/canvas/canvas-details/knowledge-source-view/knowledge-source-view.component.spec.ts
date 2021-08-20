import {ComponentFixture, TestBed} from '@angular/core/testing';

import {KnowledgeSourceViewComponent} from './knowledge-source-view.component';
import {HttpClient} from "@angular/common/http";

describe('KnowledgeSourceViewComponent', () => {
  let component: KnowledgeSourceViewComponent;
  let fixture: ComponentFixture<KnowledgeSourceViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KnowledgeSourceViewComponent ],
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
    fixture = TestBed.createComponent(KnowledgeSourceViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
