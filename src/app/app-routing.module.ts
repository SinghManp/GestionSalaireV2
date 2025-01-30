import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {SigninComponent} from './auth/signin/signin.component';
import {AuthGuardService} from './services/auth-guard.service';
import {SignupComponent} from './auth/signup/signup.component';
import {WorkerListComponent} from './worker-list/worker-list.component';
import {WorkerFormComponent} from './worker-list/worker-form/worker-form.component';
import {SingleWorkerComponent} from './worker-list/single-worker/single-worker.component';
import {WorkerDetailsComponent} from './worker-list/worker-details/worker-details.component';
import {WeekListComponent} from './week-list/week-list.component';
import {WeekFormComponent} from './week-list/week-form/week-form.component';
import {SingleWeekComponent} from './week-list/single-week/single-week.component';
import {WeekHistoryComponent} from './week-history/week-history.component';
import {NewVersionMessageComponent} from "./new-version-message/new-version-message.component";

const routes: Routes = [
    {path: "signIn", component: SigninComponent},
    {
        path: "signUp",
        canActivate: [AuthGuardService],
        component: SignupComponent,
    },
    {
        path: "workers",
        canActivate: [AuthGuardService],
        component: WorkerListComponent,
    },
    {
        path: "workers/new",
        canActivate: [AuthGuardService],
        component: WorkerFormComponent,
    },
    {
        path: "workers/view/:id",
        canActivate: [AuthGuardService],
        component: SingleWorkerComponent,
    },
    {
        path: "workers/details/:id",
        canActivate: [AuthGuardService],
        component: WorkerDetailsComponent,
    },
    {
        path: "workers/details/:id/:year",
        canActivate: [AuthGuardService],
        component: WorkerDetailsComponent,
    },
    {
        path: "weeks",
        canActivate: [AuthGuardService],
        component: WeekListComponent,
    },
    {
        path: "weeks/:id",
        canActivate: [AuthGuardService],
        component: WeekListComponent,
    },
    {
        path: "week/new",
        canActivate: [AuthGuardService],
        component: WeekFormComponent,
    },
    {
        path: "week/:id",
        canActivate: [AuthGuardService],
        component: SingleWeekComponent,
    },
    {
        path: "week/edit/:id",
        canActivate: [AuthGuardService],
        component: WeekFormComponent,
    },
    {
        path: "history",
        canActivate: [AuthGuardService],
        component: WeekHistoryComponent,
    },
    {
        path: "new",
        canActivate: [AuthGuardService],
        component: NewVersionMessageComponent,
    },
    {path: "", redirectTo: "weeks", pathMatch: "full"},
    {path: "**", redirectTo: "weeks"},
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
