import {getDatabase, ref, get} from 'firebase/database';
import {Injectable} from '@angular/core';
import {CanActivate, Router} from '@angular/router';
import {BehaviorSubject, Observable} from 'rxjs';
import {getAuth, onAuthStateChanged} from '@angular/fire/auth';

@Injectable({
    providedIn: 'root',
})
export class AuthGuardService implements CanActivate {
    user$ = new BehaviorSubject<any>(null);

    constructor(private router: Router) {
    }

    canActivate(): Observable<boolean> | Promise<boolean> | boolean {
        return new Promise((resolve) => {
            onAuthStateChanged(getAuth(), async (user) => {
                if (user) {
                    const userRef = ref(getDatabase(), 'users/' + user.uid);
                    const snapshot = await get(userRef);
                    const dbUser = snapshot.val();
                    this.user$.next(dbUser);
                    resolve(true);
                } else {
                    this.router.navigate(['/signIn']);

                    this.user$.next(null);
                    resolve(false);
                }
            });
        });
    }
}
