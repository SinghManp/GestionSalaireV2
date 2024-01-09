import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { WorkerWeekService } from '../services/worker-week.service';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkerWeek } from '../models/workerWeek.model';
import { DateService } from '../services/date.service';

@Component({
  selector: 'app-week-list',
  templateUrl: './week-list.component.html',
  styleUrls: ['./week-list.component.scss'],
})
export class WeekListComponent implements OnInit, OnDestroy {
  weeks: WorkerWeek[] = [];
  weekSubscription!: Subscription;

  currentWeek = new Date();
  year = new Date().getFullYear();
  yearList: any = [];

  isLoading = true;

  canAddNewWeek = false;

  constructor(
    private workWeekService: WorkerWeekService,
    private router: Router,
    private route: ActivatedRoute,
    public dateService: DateService
  ) {
    this.initYearList();
  }

  ngOnInit() {
    this.isLoading = true;
    this.year = this.route.snapshot.params['id'] || new Date().getFullYear();
    this.workWeekService.getWeekListFromFirebase(this.year);
    this.weekSubscription = this.workWeekService.weeksSubject.subscribe(
      (weeks: WorkerWeek[]) => {
        this.weeks = weeks;
        this.getWeeksNumbers();
        this.sortWeek();
        this.isLoading = false;
        this.canAddNewWeek =
          this.year == new Date().getFullYear() ||
          !this.workWeekService.getIsWeekInCurrentYear();
      }
    );
    this.workWeekService.emitWeek();
  }

  getDateRangeByWeekNumber(w: any, y: any) {
    var simple = new Date(y, 0, 1 + (w - 1) * 7);
    var dow = simple.getDay();
    var ISOweekStart = simple;
    if (dow <= 4) ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
    else ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());

    var firstday = new Date(ISOweekStart);
    var lastday = new Date(ISOweekStart.setDate(firstday.getDate() + 6));

    return (
      this.formatNumber(firstday.getDate()) +
      '/' +
      this.formatNumber(firstday.getMonth() + 1) +
      ' - ' +
      this.formatNumber(lastday.getDate()) +
      '/' +
      this.formatNumber(lastday.getMonth() + 1)
    );
  }

  formatNumber(num: number) {
    return ('0' + num).slice(-2);
  }

  initYearList() {
    const currentYear = new Date().getFullYear();
    for (let index = currentYear - 2; index <= currentYear; index++) {
      this.yearList.push(index);
    }
  }

  getWeeksNumbers() {
    let z: WorkerWeek[] = [];
    if (this.weeks != undefined) {
      for (let index = 0; index < this.weeks.length; index++) {
        if (this.weeks[index] != undefined) {
          z.push(this.weeks[index]);
        }
      }
    }
    this.weeks = z;
  }

  sortWeek() {
    this.weeks.sort((a: any, b: any) => {
      if (a.weekNumber > b.weekNumber) {
        return -1;
      } else return 1;
    });
  }

  goToWeek(id: number) {
    this.router.navigate(['week', id]);
  }

  newWeek() {
    this.router.navigate(['week', 'new']);
  }

  changeYear() {
    this.isLoading = true;
    this.weeks = [];
    this.workWeekService.getWeekListFromFirebase(this.year);
  }

  ngOnDestroy() {
    this.weekSubscription.unsubscribe();
  }
}
