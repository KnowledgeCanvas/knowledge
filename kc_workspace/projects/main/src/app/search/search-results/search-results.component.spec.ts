import {ComponentFixture, TestBed} from '@angular/core/testing';

import {SearchResultsComponent} from './search-results.component';
import {MatDialog} from "@angular/material/dialog";
import {HttpClient} from "@angular/common/http";

describe('SearchResultsComponent', () => {
  let component: SearchResultsComponent;
  let fixture: ComponentFixture<SearchResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SearchResultsComponent],
      providers: [
        {
          provide: MatDialog,
          useValue: {}
        },
        {
          provide: HttpClient,
          useValue: {}
        }
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
