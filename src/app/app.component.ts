import { Component, OnInit } from '@angular/core';
import { FirebaseApp } from '@angular/fire/app';
import { getAuth } from '@angular/fire/auth';
import { SwUpdate } from '@angular/service-worker';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(private afApp: FirebaseApp, private swUpdate: SwUpdate) {
    getAuth(this.afApp);
  }

  ngOnInit(): void {
    if (this.swUpdate.isEnabled) {
      this.swUpdate.available.subscribe(() => {
        window.location.reload();
      });
    }
  }
}
