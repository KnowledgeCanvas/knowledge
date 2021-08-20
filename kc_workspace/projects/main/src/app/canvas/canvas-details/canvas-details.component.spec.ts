import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CanvasDetailsComponent} from './canvas-details.component';
import {HttpClient} from "@angular/common/http";
import {Router} from "@angular/router";

describe('CanvasDetailsComponent', () => {
  let component: CanvasDetailsComponent;
  let fixture: ComponentFixture<CanvasDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CanvasDetailsComponent],
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
    fixture = TestBed.createComponent(CanvasDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
