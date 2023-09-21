import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleWorkerComponent } from './single-worker.component';

describe('SingleWorkerComponent', () => {
  let component: SingleWorkerComponent;
  let fixture: ComponentFixture<SingleWorkerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SingleWorkerComponent]
    });
    fixture = TestBed.createComponent(SingleWorkerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
