import {ComponentFixture, TestBed} from '@angular/core/testing';

import {SearchBarComponent} from './search-bar.component';
import {FormBuilder} from "@angular/forms";
import {HttpClient} from "@angular/common/http";
import {MatDialog} from "@angular/material/dialog";

describe('SearchBarComponent', () => {
  let component: SearchBarComponent;
  let fixture: ComponentFixture<SearchBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SearchBarComponent],
      providers: [
        {
          provide: FormBuilder,
          useValue: {}
        },
        {
          provide: HttpClient,
          useValue: {}
        },
        {
          provide: MatDialog,
          useValue: {}
        }
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
