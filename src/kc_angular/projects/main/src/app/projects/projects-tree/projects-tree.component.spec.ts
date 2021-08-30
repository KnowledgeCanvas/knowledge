import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {ProjectsTreeComponent} from './projects-tree.component';
import {HttpClient} from "@angular/common/http";
import {MatDialog} from "@angular/material/dialog";

describe('ProjectsTreeComponent', () => {
  let component: ProjectsTreeComponent;
  let fixture: ComponentFixture<ProjectsTreeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ProjectsTreeComponent],
      providers: [
        {
          provide: HttpClient,
          useValue: {}
        },
        {
          provide: MatDialog,
          useValue: {}
        }
      ]
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
