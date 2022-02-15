import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KsDataviewComponent } from './ks-dataview.component';

describe('KsDataviewComponent', () => {
  let component: KsDataviewComponent;
  let fixture: ComponentFixture<KsDataviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KsDataviewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KsDataviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
