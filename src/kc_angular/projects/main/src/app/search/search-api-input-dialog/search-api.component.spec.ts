import {ComponentFixture, TestBed} from '@angular/core/testing';

import {SearchApiComponent} from './search-api.component';
import {MatDialogRef} from "@angular/material/dialog";

describe('SearchApiComponent', () => {
  let component: SearchApiComponent;
  let fixture: ComponentFixture<SearchApiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SearchApiComponent],
      providers: [
        {
          provide: MatDialogRef,
          useValue: {}
        }
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchApiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
