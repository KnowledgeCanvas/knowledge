import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CanvasDetailsOverviewComponent } from './canvas-details-overview.component';
import {HttpClient} from "@angular/common/http";

describe('CanvasDetailsOverviewComponent', () => {
  let component: CanvasDetailsOverviewComponent;
  let fixture: ComponentFixture<CanvasDetailsOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CanvasDetailsOverviewComponent ],
      providers: [{
        provide: HttpClient,
        useValue: {}
      }]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CanvasDetailsOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
