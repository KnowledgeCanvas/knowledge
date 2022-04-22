import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KsThumbnailComponent } from './ks-thumbnail.component';

describe('KsThumbnailComponent', () => {
  let component: KsThumbnailComponent;
  let fixture: ComponentFixture<KsThumbnailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KsThumbnailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KsThumbnailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
