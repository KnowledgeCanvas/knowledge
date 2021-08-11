import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectsTabsComponent } from './projects-tabs.component';

describe('ProjectsTabsComponent', () => {
  let component: ProjectsTabsComponent;
  let fixture: ComponentFixture<ProjectsTabsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectsTabsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectsTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
