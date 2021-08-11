import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectContextComponent } from './project-context.component';

describe('ProjectContextComponent', () => {
  let component: ProjectContextComponent;
  let fixture: ComponentFixture<ProjectContextComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectContextComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectContextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
