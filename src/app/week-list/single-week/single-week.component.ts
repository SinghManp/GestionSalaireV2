import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Checkout } from 'src/app/models/checkout.model';
import { OneWorkerWeek } from 'src/app/models/oneWorkerWeek.model';
import { Supply } from 'src/app/models/supply.model';
import { WorkerWeek } from 'src/app/models/workerWeek.model';
import { AuthService } from 'src/app/services/auth.service';
import { WorkerWeekService } from 'src/app/services/worker-week.service';

@Component({
  selector: 'app-single-week',
  templateUrl: './single-week.component.html',
  styleUrls: ['./single-week.component.scss'],
})
export class SingleWeekComponent implements OnInit {
  week!: WorkerWeek;
  workerWeekList!: OneWorkerWeek[];
  remarkList: any = [];
  checkoutList!: Checkout[];
  suppliesList!: Supply[];
  previousCheckout!: number;
  currentCheckout!: number;
  weekNumber!: number;
  next = true;

  workersTotal: any = [];
  suppliesTotal: any;
  checkoutTotal: any;
  paiementBankTotal: any;
  paiementBankList: any = [];

  constructor(
    private route: ActivatedRoute,
    private workerWeekService: WorkerWeekService,
    private router: Router,
    readonly authService: AuthService
  ) {}

  ngOnInit() {
    this.weekNumber = this.route.snapshot.params['id'];
    this.initWeek();
  }

  initWeek() {
    this.workerWeekService
      .getSingleWeek(this.weekNumber)
      .then((workerWeek: any) => {
        if (workerWeek) {
          this.week = workerWeek;
          this.workerWeekList = workerWeek.workerList;
          this.checkoutList = workerWeek.checkoutList;
          this.suppliesList = workerWeek.suppliesList;
          this.previousCheckout = workerWeek.previousCheckout;
          this.currentCheckout = workerWeek.currentCheckout;
          this.initWorkersTotal();
          this.initSuppliesTotal();
          this.initCheckoutTotal();
          this.initDetailsList();
        } else {
          this.workerWeekList = [];
          if (this.next) {
            this.goToNextWeek();
          } else {
            this.goToPreviousWeek();
          }
        }
      });
  }

  editWeek() {
    this.router.navigate(['week', 'edit', this.weekNumber]);
  }

  goToPreviousWeek() {
    this.next = false;
    this.weekNumber--;
    if (this.weekNumber < 1) {
      this.weekNumber = 53;
    }
    this.initWeek();
  }
  goToNextWeek() {
    this.next = true;
    this.weekNumber++;
    if (this.weekNumber > 53) {
      this.weekNumber = 1;
    }
    this.initWeek();
  }

  onDetailsWorker(id: string) {
    if (id != 'EGR') {
      this.router.navigate(['/workers', 'details', id, this.week.year]);
    }
  }

  initWorkersTotal() {
    this.workersTotal[0] = 0;
    this.workersTotal[1] = 0;
    this.workersTotal[2] = 0;
    this.workersTotal[3] = 0;
    this.workersTotal[4] = 0;
    this.workersTotal[5] = 0;
    this.workersTotal[6] = 0;

    this.workerWeekList.forEach((worker) => {
      this.workersTotal[0] += +worker.previousBalance;
      this.workersTotal[1] += +worker.extra;
      this.workersTotal[2] += +worker.paiementCash;
      this.workersTotal[3] += +worker.paiementBank;
      this.workersTotal[4] += +worker.currentBalance;
      this.workersTotal[5] += +worker.salary;
      this.workersTotal[6] += +worker.cashFromSupplies;
    });
  }

  initSuppliesTotal() {
    if (this.suppliesList) {
      this.suppliesTotal = 0;
      this.suppliesList.forEach((supply) => {
        this.suppliesTotal += +supply.amount;
      });
    }
  }

  initCheckoutTotal() {
    if (this.checkoutList) {
      this.checkoutTotal = 0;
      this.checkoutList.forEach((checkout) => {
        this.checkoutTotal += +checkout.amount;
      });
    }
  }

  initDetailsList() {
    this.paiementBankTotal = 0;
    this.remarkList = [];
    this.paiementBankList = [];
    this.workerWeekList.forEach((worker) => {
      if (worker.remark) {
        this.remarkList.push({
          name: worker.name,
          remark: worker.remark,
        });
      }
      if (worker.paiementBankList) {
        worker.paiementBankList.forEach((paiement: any) => {
          if (paiement.amount > 0) {
            this.paiementBankList.push({
              name: worker.name,
              amount: paiement.amount,
              date: paiement.date,
            });
            this.paiementBankTotal += paiement.amount;
          }
        });
      }
    });
  }

  conversion(num: any) {
    if (num != undefined) {
      var str = num.toString().replace('$', ''),
        parts: any = false,
        output = [],
        i = 1,
        formatted = null;
      if (str.indexOf('.') > 0) {
        parts = str.split('.');
        str = parts[0];
        while (parts[1].length < 3) {
          parts[1] += '0';
        }
      }
      str = str.split('').reverse();
      for (var j = 0, len = str.length; j < len; j++) {
        if (str[j] != ' ') {
          output.push(str[j]);
          if (i % 3 == 0 && j < len - 1) {
            output.push(' ');
          }
          i++;
        }
      }
      formatted = output.reverse().join('');
      return formatted + (parts ? ',' + parts[1].substr(0, 2) : ',00');
    } else {
      return 'Undefined';
    }
  }

  isWorkedThisWeek(worker: OneWorkerWeek) {
    return !(
      worker.workingDays == 0 &&
      worker.previousBalance == 0 &&
      worker.extra == 0 &&
      worker.cashFromSupplies == 0 &&
      worker.paiementCash == 0 &&
      worker.paiementBank == 0 &&
      worker.currentBalance == 0
    );
  }

  isEditable() {
    return (
      this.authService.matchRole('admin') ||
      (this.getCurrentWeekNumber() - this.week?.weekNumber < 3 &&
        this.week?.year >= new Date().getFullYear())
    );
  }

  getCurrentWeekNumber() {
    let currentDate: any = new Date();
    let startDate: any = new Date(currentDate.getFullYear(), 0, 1);
    var days = Math.floor((currentDate - startDate) / (24 * 60 * 60 * 1000));

    var weekNumber = Math.ceil(days / 7);

    console.log('current week number: ', weekNumber);
    return weekNumber;
  }
}
