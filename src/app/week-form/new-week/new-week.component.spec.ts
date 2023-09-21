import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewWeekComponent } from './new-week.component';

describe('NewWeekComponent', () => {
  let component: NewWeekComponent;
  let fixture: ComponentFixture<NewWeekComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NewWeekComponent]
    });
    fixture = TestBed.createComponent(NewWeekComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
