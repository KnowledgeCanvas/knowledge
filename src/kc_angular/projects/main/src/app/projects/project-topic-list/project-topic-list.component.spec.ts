import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectTopicListComponent } from './project-topic-list.component';
import {HttpClient} from "@angular/common/http";

describe('ProjectTopicListComponent', () => {
  let component: ProjectTopicListComponent;
  let fixture: ComponentFixture<ProjectTopicListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProjectTopicListComponent ],
      providers: [
        {
          provide: HttpClient,
          useValue: {}
        }
      ]
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
