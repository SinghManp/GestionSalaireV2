import {Component} from '@angular/core';

import {WorkerWeekService} from '../services/worker-week.service';
import {DateService} from '../services/date.service';

@Component({
    selector: 'app-week-history',
    templateUrl: './week-history.component.html',
    styleUrls: ['./week-history.component.scss'],
})
export class WeekHistoryComponent {
    history: any = [];

    constructor(
        private workerWeekService: WorkerWeekService,
        public dateService: DateService
    ) {
        workerWeekService.getHistory().then((resp: any) => {
            Object.values(resp).forEach((value: any) => {
                if (typeof value === 'object' && !Array.isArray(value)) {
                    let a: any = [];
                    Object.values(value).forEach((innerValue) => {
                        a.push(innerValue);
                    });
                    let b = {
                        weekNumber: a.find((element: any) => element?.weekNumber)
                            ?.weekNumber,
                        infos: a,
                    };
                    this.history.push(b);
                }
            });

            this.history.sort((a: any, b: any) => {
                return b?.weekNumber - a?.weekNumber;
            });

            this.history.forEach((element: any) => {
                element.infos.forEach((info: any) => {
                    if (info.workerList) {
                        let a: any = [];
                        Object.keys(info.workerList).forEach((innerElement: any) => {
                            if (innerElement != null) {
                                a.push(info.workerList[innerElement]);
                            }
                        });
                        info.workerList = a;
                    }
                    if (info.checkoutList) {
                        let a: any = [];
                        Object.keys(info.checkoutList).forEach((innerElement: any) => {
                            if (innerElement != null) {
                                a.push(info.checkoutList[innerElement]);
                            }
                        });
                        info.checkoutList = a;
                    }
                });

                element.infos.sort((a: any, b: any) => {
                    const aDate = a.lastChanges || a.status?.closeStatus.lastChanges;
                    const bDate = b.lastChanges || b.status?.closeStatus.lastChanges;
                    return new Date(bDate).getTime() - new Date(aDate).getTime();
                });
            });

            console.log(this.history);
        });
    }

    getObjectKey(obj: any) {
        if (obj == null) return [];
        return Object.keys(obj);
    }
}
