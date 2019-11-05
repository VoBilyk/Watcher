import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AngularFireModule } from '@angular/fire';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { firebase } from '../environments/firebase.config';

import {
  AccordionModule,
  TabViewModule,
  ProgressSpinnerModule,
  ButtonModule,
  InputTextareaModule,
  InputTextModule,
  PanelModule,
  RadioButtonModule,
  DialogModule
} from 'primeng/primeng';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/components/confirmdialog/confirmdialog';

import { ShellModule } from './shell/shell.module';
import { CoreModule } from './core/core.module';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { LandingComponent } from './landing/landing.component';
import { InviteComponent } from './invite/invite.component';
import { AuthorizationComponent } from './authorization/authorization.component';

import { CustomConfirmDialogComponent } from './notification/custom-confirm-dialog/custom-confirm-dialog.component';
import { SystemNotificationComponent } from './notification/system-notification/system-notification.component';
import { AboutComponent } from './about/about.component';

@NgModule({
  declarations: [
    AppComponent,
    LandingComponent,
    InviteComponent,
    AuthorizationComponent,
    CustomConfirmDialogComponent,
    SystemNotificationComponent,
    AboutComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    FormsModule,
    AccordionModule,
    PanelModule,
    ButtonModule,
    RadioButtonModule,
    DialogModule,
    TabViewModule,
    ToastModule,
    ConfirmDialogModule,
    ProgressSpinnerModule,
    InputTextareaModule,
    InputTextModule,

    AngularFireModule.initializeApp(firebase),
    // AngularFireDatabaseModule,
    AngularFireAuthModule,

    CoreModule,
    AppRoutingModule,
    ShellModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
