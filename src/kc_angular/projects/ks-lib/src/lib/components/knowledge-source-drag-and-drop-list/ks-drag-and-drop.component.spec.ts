import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KsDragAndDropComponent } from './ks-drag-and-drop.component';

describe('KnowledgeSourceDragAndDropListComponent', () => {
  let component: KsDragAndDropComponent;
  let fixture: ComponentFixture<KsDragAndDropComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KsDragAndDropComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KsDragAndDropComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
