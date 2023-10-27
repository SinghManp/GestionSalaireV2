import { Component } from '@angular/core';
import { FirebaseApp } from '@angular/fire/app';
import { getAuth } from '@angular/fire/auth';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor(private afApp: FirebaseApp) {
    getAuth(this.afApp);
  }
}
