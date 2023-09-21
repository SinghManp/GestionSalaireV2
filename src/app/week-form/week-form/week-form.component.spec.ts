import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeekFormComponent } from './week-form.component';

describe('WeekFormComponent', () => {
  let component: WeekFormComponent;
  let fixture: ComponentFixture<WeekFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WeekFormComponent]
    });
    fixture = TestBed.createComponent(WeekFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
