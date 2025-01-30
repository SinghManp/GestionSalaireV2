import {Injectable, OnDestroy, OnInit} from '@angular/core';
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile,
    signOut,
} from '@angular/fire/auth';

import {
    getDatabase,
    ref,
    set,
    get,
    push,
    query,
    orderByChild,
    equalTo,
    DataSnapshot,
} from 'firebase/database';
import {AuthGuardService} from './auth-guard.service';
import {combineLatest} from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    currentUser: any;

    constructor(authGuardService: AuthGuardService) {
        combineLatest([authGuardService.user$]).subscribe(([user]) => {
            this.currentUser = user;
        });
    }

    createTeam(teamName: string, userId: string) {
        teamName = teamName.toLowerCase();
        return new Promise((resolve, reject) => {
            this.getTeamIdByName(teamName)
                .then((existTeam: DataSnapshot) => {
                    //update team users

                    const teamRef = ref(getDatabase(), 'teams/' + existTeam.key);
                    let team = existTeam.val();
                    team.users.push(userId);
                    set(teamRef, team).then((a) => {
                        resolve(existTeam.key);
                    });
                })
                .catch((error) => {
                    push(ref(getDatabase(), 'teams/'), {
                        name: teamName,
                        createAt: new Date().toISOString(),
                        createBy:
                            getAuth().currentUser?.displayName ||
                            getAuth().currentUser?.email,
                        users: [userId],
                    }).then((newTeam) => {
                        resolve(newTeam.key);
                    });
                });
        });
    }

    getTeamIdByName(teamName: string): Promise<DataSnapshot> {
        teamName = teamName.toLowerCase();
        return new Promise(async (resolve, reject) => {
            const teamsRef = ref(getDatabase(), 'teams');
            const q = query(teamsRef, orderByChild('name'), equalTo(teamName));
            const snapshot = await get(q);
            if (snapshot.exists()) {
                snapshot.forEach((childSnapshot) => {
                    resolve(childSnapshot);
                });
            } else {
                reject('Team does not exist');
            }
        });
    }

    async createNewUser(
        email: string,
        password: string,
        name: string,
        teamName: string,
        role: string
    ): Promise<any> {
        try {
            const user = await createUserWithEmailAndPassword(
                getAuth(),
                email,
                password
            );

            await updateProfile(user.user, {
                displayName: name,
            });

            const teamId = await this.createTeam(teamName, user.user.uid);

            const userRef = ref(getDatabase(), 'users/' + user.user.uid);

            await set(userRef, {
                name,
                email,
                currentTeam: teamId,
                team: [teamId],
                role,
            });

            return user;
        } catch (error) {
            console.error(error);
        }
    }

    signInUser(email: string, password: string) {
        return new Promise((resolve, reject) => {
            signInWithEmailAndPassword(getAuth(), email, password).then(
                (user) => {
                    resolve(user);
                },
                (error) => {
                    reject(error);
                }
            );
        });
    }

    matchRole(roles: string[] | string) {
        if (typeof roles === 'string') {
            return this.currentUser?.role === roles;
        } else {
            return roles.includes(this.currentUser?.role);
        }
    }

    signOutUser() {
        signOut(getAuth());
    }
}
