import { NgModule } from '@angular/core';
import { SettingsComponent } from './settings.component';
import { NotificationSettingsComponent } from './notification-settings/notification-settings.component';
import { OrganizationProfileComponent } from './organization-profile/organization-profile.component';

import { UserProfileComponent } from './user-profile/user-profile.component';
import { SettingsRoutingModule } from './settings-routing.module';
import { ImageCropperModule } from 'ngx-img-cropper';
import { InvitesListComponent } from './organization-profile/invites-list.component';
import { OrganizationMembersComponent } from './organization-members/organization-members.component';
import { SpinnerPopupComponent } from './spinner-popup/spinner-popup.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    SharedModule,
    SettingsRoutingModule,
    ImageCropperModule,
  ],
  declarations: [
    SettingsComponent,
    NotificationSettingsComponent,
    UserProfileComponent,
    OrganizationProfileComponent,
    InvitesListComponent,
    OrganizationMembersComponent,
    SpinnerPopupComponent
  ]
})
export class SettingsModule { }
