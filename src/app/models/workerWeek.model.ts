import { OneWorkerWeek } from './oneWorkerWeek.model';
import { Checkout } from './checkout.model';
import { Supply } from './supply.model';
import { Remark } from './remark.model';

export class WorkerWeek {
  weekNumber!: number;
  author!: string;
  authorMail!: string;
  lastChanges!: string;
  cashFlow!: number;
  previousCheckout!: number;
  currentCheckout!: number;
  checkoutList!: Checkout[];
  suppliesList!: Supply[];
  remarksList!: Remark[];
  year!: number;
  isOpened!: boolean;

  constructor(public workerList: OneWorkerWeek[]) {}

  getworkerList() {
    return this.workerList;
  }

  setWorkerList(workerList: OneWorkerWeek[]) {
    this.workerList = workerList;
  }

  cleatWorkerList() {
    this.workerList = [];
  }
  getWeekNumber() {
    return this.weekNumber;
  }
}
