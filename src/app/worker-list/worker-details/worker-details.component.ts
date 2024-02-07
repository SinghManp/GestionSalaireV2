import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {DateService} from 'src/app/services/date.service';
import {WorkersService} from 'src/app/services/workers.service';
import {PdfService} from "../../services/pdf.service";

@Component({
  selector: 'app-worker-details',
  templateUrl: './worker-details.component.html',
  styleUrls: ['./worker-details.component.scss'],
})
export class WorkerDetailsComponent implements OnInit {
  workerName!: string;
  year!: number;
  yearList: number[] = [];

  details: any;
  supplyList: any = [];
  itemsTotal = [7];
  remarksList: any[] = [];
  isRemarks: boolean = false;
  bankPaiementList: any = [];

  constructor(
    private workerkService: WorkersService,
    private route: ActivatedRoute,
    private router: Router,
    public dateService: DateService,
    private pdfService: PdfService
  ) {
  }

  ngOnInit() {
    this.workerName = this.route.snapshot.params['id'];
    this.year = this.route.snapshot.params['year'] || new Date().getFullYear();
    this.initYearList();
    this.initDetails();
  }

  initYearList() {
    this.yearList = [];
    for (let index = 2021; index <= new Date().getFullYear(); index++) {
      this.yearList.push(index);
    }
  }

  initDetails() {
    this.details = [];
    this.supplyList = [];
    this.workerkService
      .getWorkerDetails(this.workerName, this.year)
      .then((value: any) => {
        this.details = value.weekList;
        this.supplyList = value.supplyList;
        this.countTotal();
      });
  }

  conversion(num: any) {
    if (num) {
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
      return '0,00';
    }
  }

  countTotal() {
    this.itemsTotal[0] = 0;
    this.itemsTotal[1] = 0;
    this.itemsTotal[2] = 0;
    this.itemsTotal[3] = 0;
    this.itemsTotal[4] = 0;
    this.itemsTotal[5] = 0;
    this.itemsTotal[6] = 0;
    this.bankPaiementList = [];
    this.remarksList = [];
    this.details.forEach((week: any) => {
      this.itemsTotal[0] += +week['worker']['salary'];
      this.itemsTotal[1] += +week['worker']['previousBalance'];
      this.itemsTotal[2] += +week['worker']['extra'];
      this.itemsTotal[3] += +week['worker']['paiementCash'];
      this.itemsTotal[4] += +week['worker']['paiementBank'];
      this.itemsTotal[5] += +week['worker']['currentBalance'];
      this.itemsTotal[6] += +week['worker']['cashFromSupplies'];
      if (week['worker']['remark']) {
        this.remarksList.push({
          weekNumber: week.weekNumber,
          remark: week['worker']['remark'],
        });
        this.isRemarks = true;
      }
      if (week['worker']['paiementBankList']) {
        week['worker']['paiementBankList'].forEach((element: any) => {
          if (element.amount > 0) {
            this.bankPaiementList.push({
              weekNumber: week['weekNumber'],
              amount: element.amount,
              date: element.date,
            });
          }
        });
      }
    });
    this.itemsTotal[0] = +this.itemsTotal[0].toFixed(2);
    this.itemsTotal[1] = +this.itemsTotal[1].toFixed(2);
    this.itemsTotal[2] = +this.itemsTotal[2].toFixed(2);
    this.itemsTotal[3] = +this.itemsTotal[3].toFixed(2);
    this.itemsTotal[4] = +this.itemsTotal[4].toFixed(2);
    this.itemsTotal[5] = +this.itemsTotal[5].toFixed(2);
    this.itemsTotal[6] = +this.itemsTotal[6].toFixed(2);
  }

  onGoToWeek(id: number) {
    this.router.navigate(['week', id]);
  }

  onPrint() {
    this.pdfService.generateWorkerPdf(this.year, this.details, this.supplyList, this.bankPaiementList, this.remarksList);
  }
}
