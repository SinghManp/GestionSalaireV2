import { Component, OnDestroy, OnInit } from '@angular/core';
import { WorkerWeek } from '../models/workerWeek.model';
import { Worker } from '../models/worker.model';
import { Subscription } from 'rxjs';
import { WorkersService } from '../services/workers.service';
import { WorkerWeekService } from '../services/worker-week.service';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-worker-list',
  templateUrl: './worker-list.component.html',
  styleUrls: ['./worker-list.component.scss'],
})
export class WorkerListComponent implements OnInit, OnDestroy {
  workers!: Worker[];
  week!: WorkerWeek[];
  workersSubscription!: Subscription;
  weekSubscription!: Subscription;

  constructor(
    readonly authService: AuthService,
    private workersService: WorkersService,
    private weeksService: WorkerWeekService,
    private router: Router
  ) {}

  ngOnInit() {
    this.workersSubscription = this.workersService.workersSubject.subscribe(
      (workers: Worker[]) => {
        this.workers = workers;
      }
    );
    this.workersService.emitWorkers();
    this.weekSubscription = this.weeksService.weeksSubject.subscribe(
      (weeks: any) => {
        if (weeks) {
          this.week = weeks;
        }
      }
    );
    this.weeksService.emitWeek();
  }

  onNewWorker() {
    this.router.navigate(['/workers', 'new']);
  }

  onDeleteWorker(worker: Worker) {
    const conform = confirm('Voulez-vous vraiment supprimer ce travailleur ?');
    if (conform) {
      this.workersService.removeWorker(worker);
    }
  }

  onViewWorker(id: number) {
    this.router.navigate(['/workers', 'view', id]);
  }

  onDetailsWorker(id: number) {
    this.router.navigate(['/workers', 'details', this.workers[id]['name']]);
  }

  ngOnDestroy() {
    this.workersSubscription.unsubscribe();
  }
}
