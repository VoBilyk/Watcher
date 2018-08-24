import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

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
  ProgressSpinnerModule
} from 'primeng/primeng';
import { LeftSideMenuComponent } from './left-side-menu/left-side-menu.component';
import { ChatModule } from '../chat/chat.module';
import { query } from '@angular/core/src/render3/query';
import { DownloadAppComponent } from '../download-app/download-app.component';
import { AddNewOrganizationComponent } from './add-new-organization/add-new-organization.component';
import { FormsModule } from '@angular/forms';
import { ClickOutsideDirective } from '../core/directives/click-outside.directive';

@NgModule({
  imports: [
    CommonModule,
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
    ProgressSpinnerModule
  ],
  declarations: [
    ShellComponent,
    HeaderComponent,
    LeftSideMenuComponent,
    AddNewOrganizationComponent,
    ClickOutsideDirective,
    DownloadAppComponent
  ]
})
export class ShellModule { }
