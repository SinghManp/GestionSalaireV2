import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { getAuth, onAuthStateChanged } from '@angular/fire/auth';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  userName: string = '';
  isAuth: boolean = false;

  isDarkMode: boolean | string = 'false';

  env!: any;

  constructor(readonly authService: AuthService) {}

  ngOnInit() {
    this.initEnv();

    onAuthStateChanged(getAuth(), (user) => {
      console.log('useruseruseruseruser', user);
      if (user) {
        this.isAuth = true;
        this.userName = user.displayName || '';
      } else {
        this.isAuth = false;
        this.userName = '';
      }
    });
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
}
