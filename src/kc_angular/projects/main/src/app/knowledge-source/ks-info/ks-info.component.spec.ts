import {ComponentFixture, TestBed} from '@angular/core/testing';

import {KsInfoComponent} from './ks-info.component';
import {MatMenuModule} from "@angular/material/menu";

describe('KsInfoComponent', () => {
  let component: KsInfoComponent;
  let fixture: ComponentFixture<KsInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatMenuModule],

      declarations: [KsInfoComponent],
      providers: [
        MatMenuModule
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KsInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
