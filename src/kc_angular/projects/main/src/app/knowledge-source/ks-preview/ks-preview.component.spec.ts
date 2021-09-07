import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KsPreviewComponent } from './ks-preview.component';

describe('KsPreviewComponent', () => {
  let component: KsPreviewComponent;
  let fixture: ComponentFixture<KsPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KsPreviewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KsPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
