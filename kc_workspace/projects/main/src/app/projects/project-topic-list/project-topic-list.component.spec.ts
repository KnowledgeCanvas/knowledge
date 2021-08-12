import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectTopicListComponent } from './project-topic-list.component';

describe('ProjectTopicListComponent', () => {
  let component: ProjectTopicListComponent;
  let fixture: ComponentFixture<ProjectTopicListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProjectTopicListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectTopicListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
