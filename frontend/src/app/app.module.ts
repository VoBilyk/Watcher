import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { firebase } from '../environments/firebase.config';

import { ShellModule } from './shell/shell.module';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
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
    BrowserAnimationsModule,

    AngularFireModule.initializeApp(firebase),
    AngularFireAuthModule,

    CoreModule,
    AppRoutingModule,
    ShellModule,
    SharedModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
