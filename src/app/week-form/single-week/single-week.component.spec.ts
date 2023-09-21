import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleWeekComponent } from './single-week.component';

describe('SingleWeekComponent', () => {
  let component: SingleWeekComponent;
  let fixture: ComponentFixture<SingleWeekComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SingleWeekComponent]
    });
    fixture = TestBed.createComponent(SingleWeekComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
