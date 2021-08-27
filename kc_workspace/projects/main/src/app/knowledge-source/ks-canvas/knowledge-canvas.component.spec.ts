import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KnowledgeCanvasComponent } from './knowledge-canvas.component';

describe('CanvasComponent', () => {
  let component: KnowledgeCanvasComponent;
  let fixture: ComponentFixture<KnowledgeCanvasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KnowledgeCanvasComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KnowledgeCanvasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
