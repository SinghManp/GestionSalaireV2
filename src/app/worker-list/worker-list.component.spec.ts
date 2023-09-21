import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkerListComponent } from './worker-list.component';

describe('WorkerListComponent', () => {
  let component: WorkerListComponent;
  let fixture: ComponentFixture<WorkerListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WorkerListComponent]
    });
    fixture = TestBed.createComponent(WorkerListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
