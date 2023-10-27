import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { WorkersService } from 'src/app/services/workers.service';
import { Worker } from '../../models/worker.model';

@Component({
  selector: 'app-worker-form',
  templateUrl: './worker-form.component.html',
  styleUrls: ['./worker-form.component.scss'],
})
export class WorkerFormComponent implements OnInit {
  workerForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private workersService: WorkersService,
    private router: Router
  ) {}

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.workerForm = this.formBuilder.group({
      name: ['', Validators.required],
      salaire: ['', Validators.required],
    });
  }

  onSaveWorker() {
    const name = this.workerForm.get('name')?.value;
    const salaire = +this.workerForm.get('salaire')?.value;
    const newWorker = new Worker(name, salaire);
    this.workersService.createNewWorker(newWorker);
    this.router.navigate(['/workers']);
  }

  test() {
    console.log('test');
  }
}
