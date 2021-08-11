import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectsTreeViewComponent } from './projects-tree-view.component';

describe('ProjectsTreeViewComponent', () => {
  let component: ProjectsTreeViewComponent;
  let fixture: ComponentFixture<ProjectsTreeViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectsTreeViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectsTreeViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
