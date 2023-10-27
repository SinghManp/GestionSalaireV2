import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkersService } from 'src/app/services/workers.service';
import { Worker } from '../../models/worker.model';

@Component({
  selector: 'app-single-worker',
  templateUrl: './single-worker.component.html',
  styleUrls: ['./single-worker.component.scss'],
})
export class SingleWorkerComponent implements OnInit {
  myform!: FormGroup;
  workerForm!: FormGroup;
  worker!: Worker;

  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private workersService: WorkersService,
    private router: Router
  ) {}

  ngOnInit() {
    this.worker = new Worker('', 0);
    const id = this.route.snapshot.params['id'];
    this.workersService.getSingleWorker(+id).then((worker: Worker) => {
      this.worker = worker;
      this.initForm();
    });
    this.workerForm = this.formBuilder.group({
      name: [this.worker.name, Validators.required],
      salaire: [this.worker.salaire, Validators.required],
    });
  }
  initForm() {
    this.workerForm = this.formBuilder.group({
      name: [this.worker.name, Validators.required],
      salaire: [this.worker.salaire, Validators.required],
    });
  }
  onBack() {
    this.router.navigate(['/workers']);
  }

  onSaveWorker() {
    const name = this.workerForm.get('name')?.value;
    const salaire = +this.workerForm.get('salaire')?.value;
    const newWorker = new Worker(name, salaire);
    const id = this.route.snapshot.params['id'];
    this.workersService.setSingleWorker(+id, newWorker);
    this.workersService.saveWorkers();
    this.router.navigate(['/workers']);
  }
}
