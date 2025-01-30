import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { CURRENCY_MASK_CONFIG, CurrencyMaskModule } from 'ng2-currency-mask';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { provideAuth, getAuth } from '@angular/fire/auth';

import { environment } from 'src/environments/environment';
import { CursorAtEndDirective } from './directive/cursor-at-end.directive';

import { AppComponent } from './app.component';
import { SingleWorkerComponent } from './worker-list/single-worker/single-worker.component';
import { WorkerDetailsComponent } from './worker-list/worker-details/worker-details.component';
import { WorkerFormComponent } from './worker-list/worker-form/worker-form.component';
import { WorkerListComponent } from './worker-list/worker-list.component';
import { SingleWeekComponent } from './week-list/single-week/single-week.component';
import { WeekHistoryComponent } from './week-history/week-history.component';
import { HeaderComponent } from './header/header.component';
import { SigninComponent } from './auth/signin/signin.component';
import { SignupComponent } from './auth/signup/signup.component';
import { WeekListComponent } from './week-list/week-list.component';
import { WeekFormComponent } from './week-list/week-form/week-form.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { VersionComponent } from './version/version.component';
import { NewVersionMessageComponent } from './new-version-message/new-version-message.component';
import { PrintPopupComponent } from './print-popup/print-popup.component';

@NgModule({
  declarations: [
    AppComponent,
    SingleWorkerComponent,
    WorkerDetailsComponent,
    WorkerFormComponent,
    WorkerListComponent,
    SingleWeekComponent,
    WeekHistoryComponent,
    WeekListComponent,
    HeaderComponent,
    SigninComponent,
    SignupComponent,
    CursorAtEndDirective,
    WeekFormComponent,
    VersionComponent,
    NewVersionMessageComponent,
    PrintPopupComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppRoutingModule,
    CurrencyMaskModule,
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideFirestore(() => getFirestore()),
    provideAuth(() => getAuth()),
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
  providers: [
    {
      provide: CURRENCY_MASK_CONFIG,
      useValue: environment.customCurrencyMaskConfig,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
