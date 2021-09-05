import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectDetailsOverviewComponent } from './project-details-overview.component';
import {HttpClient} from "@angular/common/http";

describe('CanvasDetailsOverviewComponent', () => {
  let component: ProjectDetailsOverviewComponent;
  let fixture: ComponentFixture<ProjectDetailsOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProjectDetailsOverviewComponent, window.api ],
      providers: [{
        provide: HttpClient,
        useValue: {}
      }]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectDetailsOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
