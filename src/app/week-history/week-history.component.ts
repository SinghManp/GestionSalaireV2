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
    console.log('workerWeekService.getHistory()');
    workerWeekService.getHistory().then((resp) => {
      console.log('history', resp);
      this.history = resp;
    });
  }
}
