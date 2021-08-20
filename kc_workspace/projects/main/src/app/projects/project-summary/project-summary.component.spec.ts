import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ProjectSummaryComponent} from './project-summary.component';
import {HttpClient} from "@angular/common/http";

describe('ProjectSummaryComponent', () => {
  let component: ProjectSummaryComponent;
  let fixture: ComponentFixture<ProjectSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProjectSummaryComponent],
      providers: [{
        provide: HttpClient,
        useValue: {}
      }]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
