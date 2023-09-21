import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeekHistoryComponent } from './week-history.component';

describe('WeekHistoryComponent', () => {
  let component: WeekHistoryComponent;
  let fixture: ComponentFixture<WeekHistoryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WeekHistoryComponent]
    });
    fixture = TestBed.createComponent(WeekHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
