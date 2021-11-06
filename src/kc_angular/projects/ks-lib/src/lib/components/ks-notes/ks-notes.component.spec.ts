import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KsNotesComponent } from './ks-notes.component';

describe('KsNotesComponent', () => {
  let component: KsNotesComponent;
  let fixture: ComponentFixture<KsNotesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KsNotesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KsNotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
