import {ComponentFixture, TestBed} from '@angular/core/testing';

import {KnowledgeSourceTableComponent} from './knowledge-source-table.component';
import {HttpClient} from "@angular/common/http";

describe('KnowledgeSourceViewComponent', () => {
  let component: KnowledgeSourceTableComponent;
  let fixture: ComponentFixture<KnowledgeSourceTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KnowledgeSourceTableComponent ],
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
    fixture = TestBed.createComponent(KnowledgeSourceTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
