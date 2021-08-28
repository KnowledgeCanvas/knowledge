import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KsQueueComponent } from './ks-queue.component';

describe('KsQueueComponent', () => {
  let component: KsQueueComponent;
  let fixture: ComponentFixture<KsQueueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KsQueueComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KsQueueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
