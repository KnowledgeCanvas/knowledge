import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectsNavigationComponent } from './projects-navigation.component';

describe('ProjectsNavigationComponent', () => {
  let component: ProjectsNavigationComponent;
  let fixture: ComponentFixture<ProjectsNavigationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectsNavigationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectsNavigationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
