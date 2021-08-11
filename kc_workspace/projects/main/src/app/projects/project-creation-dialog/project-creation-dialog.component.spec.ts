import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectCreationDialogComponent } from './project-creation-dialog.component';

describe('ProjectCreationDialogComponent', () => {
  let component: ProjectCreationDialogComponent;
  let fixture: ComponentFixture<ProjectCreationDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectCreationDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectCreationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
