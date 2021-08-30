import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoteCreationComponent } from './note-creation.component';

describe('NoteCreationComponent', () => {
  let component: NoteCreationComponent;
  let fixture: ComponentFixture<NoteCreationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NoteCreationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NoteCreationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
