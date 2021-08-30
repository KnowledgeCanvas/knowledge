import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {ProjectDetailViewportComponent} from './project-detail-viewport.component';
import {HttpClient} from "@angular/common/http";
import {MatSnackBar} from "@angular/material/snack-bar";

describe('ProjectDetailViewportComponent', () => {
  let component: ProjectDetailViewportComponent;
  let fixture: ComponentFixture<ProjectDetailViewportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ProjectDetailViewportComponent],
      providers: [
        {
          provide: HttpClient,
          useValue: {}
        },
        {
          provide: MatSnackBar,
          useValue: {}
        }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectDetailViewportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
