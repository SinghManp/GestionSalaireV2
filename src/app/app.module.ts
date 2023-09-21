import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SingleWorkerComponent } from './worker-list/single-worker/single-worker.component';
import { WorkerDetailsComponent } from './worker-list/worker-details/worker-details.component';
import { WorkerFormComponent } from './worker-list/worker-form/worker-form.component';
import { WorkerListComponent } from './worker-list/worker-list.component';
import { WeekFormComponent } from './week-form/week-form.component';
import { NewWeekComponent } from './week-form/new-week/new-week.component';
import { SingleWeekComponent } from './week-form/single-week/single-week.component';
import { WeekHistoryComponent } from './week-history/week-history.component';
import { HeaderComponent } from './header/header.component';
import { SigninComponent } from './auth/signin/signin.component';
import { SignupComponent } from './auth/signup/signup.component';

@NgModule({
  declarations: [
    AppComponent,
    SingleWorkerComponent,
    WorkerDetailsComponent,
    WorkerFormComponent,
    WorkerListComponent,
    WeekFormComponent,
    NewWeekComponent,
    SingleWeekComponent,
    WeekHistoryComponent,
    HeaderComponent,
    SigninComponent,
    SignupComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
