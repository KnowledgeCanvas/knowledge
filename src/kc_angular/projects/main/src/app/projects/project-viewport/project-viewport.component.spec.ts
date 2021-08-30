import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ProjectViewportComponent} from './project-viewport.component';
import {HttpClient} from "@angular/common/http";
import {Router} from "@angular/router";

describe('CanvasDetailsComponent', () => {
  let component: ProjectViewportComponent;
  let fixture: ComponentFixture<ProjectViewportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProjectViewportComponent],
      providers: [{
        provide: HttpClient,
        useValue: {}
      }, {
        provide: Router,
        useValue: {}
      }]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectViewportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
