import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectCalendarComponent } from './project-calendar.component';

describe('ProjectCalendarComponent', () => {
  let component: ProjectCalendarComponent;
  let fixture: ComponentFixture<ProjectCalendarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProjectCalendarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
