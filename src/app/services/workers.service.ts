import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Worker } from '../models/worker.model';

import { getDatabase, ref, set, onValue, child, get } from 'firebase/database';

@Injectable({
  providedIn: 'root',
})
export class WorkersService {
  workers: any[] = [];
  workersSubject = new Subject<Worker[]>();
  weekList!: any[];

  constructor() {
    this.getWorkers();
  }

  emitWorkers() {
    this.workersSubject.next(this.workers);
  }

  saveWorkers() {
    set(ref(getDatabase(), '/workers'), this.workers);
  }

  getWorkers() {
    onValue(ref(getDatabase(), '/workers'), (snapshot) => {
      this.workers = snapshot.val() ? snapshot.val() : [];
      this.emitWorkers();
    });
  }

  getAllWorkersFromFirebase() {
    return new Promise((resolve, reject) => {
      get(child(ref(getDatabase()), '/workers')).then((snapshot) => {
        this.workers = snapshot.val() ? snapshot.val() : [];
        resolve(this.workers);
      });
    });
  }

  getSingleWorker(id: number): Promise<Worker> {
    return new Promise((resolve) => {
      get(child(ref(getDatabase()), '/workers/' + id)).then((snapshot) => {
        resolve(new Worker(snapshot.val().name, snapshot.val().salaire));
      });
    });
  }

  getSingleWorkerSalary(workerName: string) {
    let salary: number = 0;

    this.workers.forEach((worker) => {
      if (worker.name == workerName) {
        salary = worker.salaire;
      }
    });
    return salary;
  }

  createNewWorker(newWorker: Worker) {
    this.workers.push(newWorker);
    this.saveWorkers();
    this.emitWorkers();
  }

  setSingleWorker(id: number, worker: Worker) {
    this.workers[id] = worker;
  }

  removeWorker(worker: Worker) {
    const workerIndexToRemove = this.workers.findIndex(
      (workerEl) => workerEl === worker
    );
    this.workers.splice(workerIndexToRemove, 1);
    this.saveWorkers();
    this.emitWorkers();
  }

  async getWorkersNames() {
    if (this.workers.length == 0) {
      await this.getAllWorkersFromFirebase();
    }

    let workerName: string[] = [];
    this.workers.forEach((worker) => {
      workerName.push(worker.name);
    });
    return workerName;
  }

  getWorkerDetails(workerName: string, year: number) {
    let weekX = 'year-' + year;
    return new Promise((resolve, reject) => {
      get(child(ref(getDatabase()), weekX)).then((snapshot) => {
        this.weekList = snapshot.val() ? snapshot.val() : [];
        let workerDetails: any = { weekList: [], supplyList: [] };
        this.weekList.forEach((week: any) => {
          week?.workerList?.forEach((worker: any) => {
            if (workerName == worker.name) {
              workerDetails.weekList.push({
                weekNumber: week.weekNumber,
                worker: worker,
              });
            }
          });
          if (week.suppliesList)
            week.suppliesList.forEach((element: any) => {
              if (
                element.payedBy == workerName ||
                element.payedFor == workerName
              ) {
                workerDetails.supplyList.push({
                  weekNumber: week.weekNumber,
                  supply: element,
                });
              }
            });
        });
        resolve(workerDetails);
      });
    });
  }
}
