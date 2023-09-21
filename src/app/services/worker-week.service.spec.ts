import { TestBed } from '@angular/core/testing';

import { WorkerWeekService } from './worker-week.service';

describe('WorkerWeekService', () => {
  let service: WorkerWeekService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorkerWeekService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
