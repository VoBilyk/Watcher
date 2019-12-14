import { NgModule } from '@angular/core';
import { ShellRoutingModule } from './shell-routing.module';
import { ShellComponent } from './shell.component';

import { HeaderComponent } from './header/header.component';
import { LeftSideMenuComponent } from './left-side-menu/left-side-menu.component';
import { ChatModule } from '../chat/chat.module';
import { AddNewOrganizationComponent } from './add-new-organization/add-new-organization.component';
import { NotificationBlockComponent } from '../notification/notification-block/notification-block.component';
import { SpinnerPopupComponent } from './spinner-popup/spinner-popup.component';
import { InstanceListComponent } from './instance-list/instance-list.component';
import { DownloadAppComponent } from './download-app/download-app.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    SharedModule,
    ShellRoutingModule,
    ChatModule
  ],
  declarations: [
    ShellComponent,
    HeaderComponent,
    LeftSideMenuComponent,
    InstanceListComponent,
    DownloadAppComponent,
    AddNewOrganizationComponent,
    NotificationBlockComponent,
    SpinnerPopupComponent
  ]
})
export class ShellModule { }
