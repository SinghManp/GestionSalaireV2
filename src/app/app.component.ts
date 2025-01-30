import {Component, OnDestroy, OnInit} from '@angular/core';
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
    timeOutList: any = [];

    constructor(private afApp: FirebaseApp, private swUpdate: SwUpdate, private router: Router) {
        getAuth(this.afApp);
    }

    ngOnInit(): void {
        if (this.swUpdate.isEnabled) {
            this.swUpdate.available.subscribe(() => {
                this.router.navigate(['/new']).then(() => {
                    window.location.reload();
                });
            });
        }
    }
}
