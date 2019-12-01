import { NgModule } from '@angular/core';
import { ShellRoutingModule } from './shell-routing.module';
import { ShellComponent } from './shell.component';

import { HeaderComponent } from './header/header.component';
import {
  ToolbarModule,
  TieredMenuModule,
  ButtonModule,
  DialogModule,
  MessagesModule,
  MessageModule,
  GrowlModule,
  PanelMenuModule,
  InputTextModule,
  InputTextareaModule,
  InputMaskModule,
  ProgressSpinnerModule,
  AccordionModule,
  OverlayPanelModule
} from 'primeng/primeng';
import { LeftSideMenuComponent } from './left-side-menu/left-side-menu.component';
import { ChatModule } from '../chat/chat.module';
import { AddNewOrganizationComponent } from './add-new-organization/add-new-organization.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NotificationBlockComponent } from '../notification/notification-block/notification-block.component';
import { SpinnerPopupComponent } from './spinner-popup/spinner-popup.component';
import { InstanceListComponent } from './instance-list/instance-list.component';
import { DownloadAppComponent } from './download-app/download-app.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    SharedModule,
    ShellRoutingModule,

    ToolbarModule,
    TieredMenuModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    InputMaskModule,
    InputTextareaModule,
    DialogModule,
    GrowlModule,
    MessagesModule,
    MessageModule,
    PanelMenuModule,
    ChatModule,
    DialogModule,
    ProgressSpinnerModule,
    AccordionModule,
    OverlayPanelModule,
    ReactiveFormsModule
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
