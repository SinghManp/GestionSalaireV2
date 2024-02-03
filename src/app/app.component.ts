import {Component, OnInit} from '@angular/core';
import {FirebaseApp} from '@angular/fire/app';
import {getAuth} from '@angular/fire/auth';
import {SwUpdate} from '@angular/service-worker';
import {Router} from "@angular/router";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  newUpdate: boolean = false;

  constructor(private afApp: FirebaseApp, private swUpdate: SwUpdate, private router: Router) {
    getAuth(this.afApp);
  }

  ngOnInit(): void {
    if (this.swUpdate.isEnabled) {
      this.swUpdate.available.subscribe(() => {
        this.showUpdate();
        this.router.navigate(['/week']).then(() => {
          window.location.reload();
          setTimeout(() => {
            this.hideUpdate();
          }, 5000);
        });
      });
    }
  }

  showUpdate() {
    this.newUpdate = true;
  }

  hideUpdate() {
    this.newUpdate = false;
  }
}
