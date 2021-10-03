import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KnowledgeSourceDragAndDropListComponent } from './knowledge-source-drag-and-drop-list.component';

describe('KnowledgeSourceDragAndDropListComponent', () => {
  let component: KnowledgeSourceDragAndDropListComponent;
  let fixture: ComponentFixture<KnowledgeSourceDragAndDropListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KnowledgeSourceDragAndDropListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KnowledgeSourceDragAndDropListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
