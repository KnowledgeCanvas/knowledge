import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageHeaderLargeComponent } from './page-header-large.component';

describe('PageHeaderLargeComponent', () => {
  let component: PageHeaderLargeComponent;
  let fixture: ComponentFixture<PageHeaderLargeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PageHeaderLargeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PageHeaderLargeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
