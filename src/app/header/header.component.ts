import {Component, OnDestroy, OnInit} from '@angular/core';
import {AuthService} from '../services/auth.service';
import {getAuth, onAuthStateChanged} from '@angular/fire/auth';
import {environment} from 'src/environments/environment';
import * as $ from 'jquery';
import {fromEvent, merge, of, Subscription} from 'rxjs';
import {map} from 'rxjs/operators';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
    networkStatus: boolean = false;
    networkStatus$: Subscription = Subscription.EMPTY;
    userName: string = '';
    isAuth: boolean = false;

    isDarkMode: boolean | string = 'false';

    env!: any;

    constructor(readonly authService: AuthService) {
    }

    ngOnInit() {
        this.initEnv();

        onAuthStateChanged(getAuth(), (user) => {
            if (user) {
                this.isAuth = true;
                this.userName = user.displayName || '';
            } else {
                this.isAuth = false;
                this.userName = '';
            }
        });
        this.checkNetworkStatus();
    }

    ngOnDestroy(): void {
        this.networkStatus$.unsubscribe();
    }

    closeNavbarMenu() {
        if (window.innerWidth < 768) {
            // Bootstrap 3 breakpoint for mobile
            const navbarMenu = document.getElementById('navbar-menu');
            if (navbarMenu?.classList.contains('in')) {
                navbarMenu.classList.remove('in');
                // Alternatively, if you're using jQuery: $('#navbar-menu').collapse('hide');
            }
        }
    }

    initEnv() {
        this.initDarkMode();
        this.env = environment;

        window.onbeforeprint = function () {
            document.body.classList.remove('dark-mode');
        };

        window.onafterprint = function () {
            if (localStorage.getItem('darkMode') === 'true') {
                document.body.classList.add('dark-mode');
            }
        };
    }

    initDarkMode() {
        this.isDarkMode = localStorage.getItem('darkMode') === 'true';
        if (this.isDarkMode) {
            document.body.classList.add('dark-mode');
        }
    }

    onToggleDarkMode() {
        document.body.classList.toggle('dark-mode');

        this.isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', this.isDarkMode + '');
    }

    onSignOut() {
        this.authService.signOutUser();
    }

    checkNetworkStatus() {
        this.networkStatus = navigator.onLine;
        this.networkStatus$ = merge(
            of(null),
            fromEvent(window, 'online'),
            fromEvent(window, 'offline')
        )
            .pipe(map(() => navigator.onLine))
            .subscribe((status) => {
                this.networkStatus = status;
            });
    }
}
