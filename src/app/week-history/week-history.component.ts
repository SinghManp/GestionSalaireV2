import { Component } from '@angular/core';

import { WorkerWeekService } from '../services/worker-week.service';

@Component({
  selector: 'app-week-history',
  templateUrl: './week-history.component.html',
  styleUrls: ['./week-history.component.scss'],
})
export class WeekHistoryComponent {
  history: any;

  constructor(private workerWeekService: WorkerWeekService) {
    workerWeekService.getHistory().then((resp: any) => {
      this.history = resp;

    });
  }

  getObjectKey(obj: any) {
    if (obj == null) return [];
    return Object.keys(obj);
  }
}
