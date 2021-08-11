import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ProjectsTreeComponent } from './projects-tree.component';

describe('ProjectsTreeComponent', () => {
  let component: ProjectsTreeComponent;
  let fixture: ComponentFixture<ProjectsTreeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectsTreeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectsTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
