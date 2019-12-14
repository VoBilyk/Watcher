import { NgModule } from '@angular/core';
import { AdminRoutingModule } from './admin-routing.module';
import { OrganizationListComponent } from './organization-list/organization-list.component';
import { UserListComponent } from './user-list/user-list.component';
import { FeedbackListComponent } from './feedback-list/feedback-list.component';

import { ImageCropperModule } from 'ngx-img-cropper';
import { DataCollectorComponent } from './data-collector/data-collector.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    SharedModule,
    AdminRoutingModule,
    ImageCropperModule,
  ],
  declarations: [
    FeedbackListComponent,
    UserListComponent,
    OrganizationListComponent,
    DataCollectorComponent
  ]
})
export class AdminModule { }
