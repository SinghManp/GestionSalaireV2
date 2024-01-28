import { Injectable } from '@angular/core';
import { WorkerWeek } from '../models/workerWeek.model';
import { Subject } from 'rxjs';
import { getAuth } from '@angular/fire/auth';
import { transform, isEqual, isObject } from 'lodash';

import {
  getDatabase,
  ref,
  set,
  onValue,
  get,
  child,
  push,
} from 'firebase/database';

@Injectable({
  providedIn: 'root',
})
export class WorkerWeekService {
  week: WorkerWeek = new WorkerWeek([]);
  weekRetrieve: WorkerWeek[] = [];
  workersWeekSubject = new Subject<WorkerWeek[]>();
  weekList!: any[];
  weeksSubject = new Subject<WorkerWeek[]>();

  weekX: any = 'year-' + new Date().getFullYear();

  isWeekInCurrentYear = false;

  constructor() {
    // this.getWeekListFromFirebase();
  }

  emitWorkersWeek() {
    this.workersWeekSubject.next(this.weekRetrieve);
  }

  emitWeek() {
    this.weeksSubject.next(this.weekList);
  }

  saveWorkersWeek(newWeek: any) {
    newWeek.lastChanges = new Date().toUTCString();
    newWeek.author = getAuth().currentUser?.displayName;
    newWeek.authorMail = getAuth().currentUser?.email;
    this.saveHistory(newWeek);

    set(ref(getDatabase(), this.weekX + '/' + newWeek.weekNumber), newWeek);

    this.emitWorkersWeek();
  }

  saveHistory(newWeek: any) {
    let oldWeek = this.weekList?.find(
      (element: any) => element?.weekNumber == newWeek.weekNumber
    );
    if (oldWeek) {
      let diff = this.difference(oldWeek, newWeek);

      diff.lastChanges = newWeek.lastChanges;
      diff.author = newWeek.author;
      diff.authorMail = newWeek.authorMail;

      push(
        child(
          ref(getDatabase()),
          'history-' + this.weekX + '/' + newWeek['weekNumber']
        ),
        diff
      );
    }
  }

  /**
   * Deep diff between two object, using lodash
   * @param object Object compared
   * @param base Object to compare with
   * @return Return a new object who represent the diff
   */
  difference(object: any, base: any) {
    return transform(object, (result: any, value, key) => {
      if (!isEqual(value, base[key])) {
        if (base.name) result.name = base.name;
        if (base.weekNumber) result.weekNumber = base.weekNumber;
        result[key] =
          isObject(value) && isObject(base[key])
            ? this.difference(value, base[key])
            : `${value} ➡️ ${base[key]}`;
      }
    });
  }

  getWokersWeek(id: number) {
    onValue(ref(getDatabase(), this.weekX + '/' + id), (snapshot) => {
      this.weekRetrieve = snapshot.val() ? snapshot.val() : [];
      this.emitWorkersWeek();
    });
  }

  getSingleWeek(id: number) {
    return new Promise((resolve, reject) => {
      get(child(ref(getDatabase()), '/' + this.weekX + '/' + id)).then(
        (snapshot) => {
          resolve(snapshot.val());
        }
      );
    });
  }

  getLastWeek() {
    return new Promise((resolve, reject) => {
      get(child(ref(getDatabase()), '/' + this.weekX)).then((snapshot) => {
        if (snapshot.val() == undefined) {
          const year = 'year-' + (this.weekX.substr(this.weekX.length - 4) - 1);
          get(child(ref(getDatabase()), '/' + year)).then((snapshot) => {
            resolve(snapshot.val());
          });
        } else {
          resolve(snapshot.val());
        }
      });
    });
  }

  getWeekListFromFirebase(year: any) {
    this.setWeekX(year);

    onValue(ref(getDatabase(), this.weekX), (snapshot) => {
      this.weekList = snapshot.val() ? snapshot.val() : [];
      if (year == new Date().getFullYear() && this.weekList.length > 0) {
        this.isWeekInCurrentYear = true;
      }
      this.emitWeek();
    });
  }

  getIsWeekInCurrentYear() {
    return this.isWeekInCurrentYear;
  }

  setWeekX(year: any) {
    this.weekX = 'year-' + year;
  }

  getHistory() {
    return new Promise((resolve) => {
      const db = getDatabase();

      const starCountRef = ref(db, 'history-' + this.weekX + '/');
      onValue(starCountRef, (snapshot) => {
        resolve(snapshot.val());
      });
    });
  }

  updateAllWeeks() {
    if (this.weekList) {
      for (let week = 2; week < this.weekList.length; week++) {
        for (
          let previousWorkerWeek = 0;
          previousWorkerWeek < this.weekList[week - 1]['workerList'].length;
          previousWorkerWeek++
        ) {
          const worker =
            this.weekList[week - 1]['workerList'][previousWorkerWeek]['name'];
          let workerFound: boolean = false;

          this.weekList[week]['previousCheckout'] =
            +this.weekList[week - 1]['currentCheckout'];
          let currentCheckout: number =
            +this.weekList[week]['previousCheckout'];
          for (
            let currentWorkerWeek = 0;
            currentWorkerWeek < this.weekList[week]['workerList'].length;
            currentWorkerWeek++
          ) {
            if (
              worker ==
              this.weekList[week]['workerList'][currentWorkerWeek]['name']
            ) {
              workerFound = true;
              let previousBalance1 = parseFloat(
                this.weekList[week]['workerList'][currentWorkerWeek][
                  'previousBalance'
                ]
              );
              let currentBalance = parseFloat(
                this.weekList[week]['workerList'][currentWorkerWeek][
                  'currentBalance'
                ]
              );
              this.weekList[week]['workerList'][currentWorkerWeek][
                'previousBalance'
              ] = parseFloat(
                this.weekList[week - 1]['workerList'][previousWorkerWeek][
                  'currentBalance'
                ]
              );
              let previousBalance2 = parseFloat(
                this.weekList[week]['workerList'][currentWorkerWeek][
                  'previousBalance'
                ]
              );
              let total: number =
                +currentBalance - +previousBalance1 + (previousBalance2 + 0);
              this.weekList[week]['workerList'][currentWorkerWeek][
                'currentBalance'
              ] = +total.toFixed(2);
            }
            currentCheckout -=
              this.weekList[week]['workerList'][currentWorkerWeek]['paiementCash'];
          }
          if (!workerFound) {
            const balance = parseFloat(
              this.weekList[week - 1]['workerList'][previousWorkerWeek][
                'currentBalance'
              ]
            );
            const dailySalary = parseFloat(
              this.weekList[week - 1]['workerList'][previousWorkerWeek][
                'dailySalary'
              ]
            );
            let workerNotFound = {
              name: worker,
              dailySalary: dailySalary,
              workingDays: 0,
              salary: 0,
              extra: 0,
              paiementBank: 0,
              paiementCash: 0,
              paiementBankList: {},
              cashFromSupplies: 0,
              totalCash: 0,
              currentBalance: +balance,
              previousBalance: +balance,
            };
            this.weekList[week]['workerList'].push(workerNotFound);
          }
          if (this.weekList[week]['checkoutList']) {
            for (
              let checkout = 0;
              checkout < this.weekList[week]['checkoutList'].length;
              checkout++
            ) {
              currentCheckout =
                +currentCheckout +
                this.weekList[week]['checkoutList'][checkout]['amount'];
            }
          }
          this.weekList[week]['currentCheckout'] = +currentCheckout.toFixed(2);
        }
      }

      set(ref(getDatabase(), this.weekX), this.weekList);
      this.emitWeek();
    }
  }
}
