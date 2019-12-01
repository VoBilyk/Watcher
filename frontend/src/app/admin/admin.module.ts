import { NgModule } from '@angular/core';
import { AdminRoutingModule } from './admin-routing.module';
import { OrganizationListComponent } from './organization-list/organization-list.component';
import { UserListComponent } from './user-list/user-list.component';
import { FeedbackListComponent } from './feedback-list/feedback-list.component';
import { DialogModule } from 'primeng/dialog';
import { TabViewModule, InputTextModule, ButtonModule, ToggleButtonModule, InputTextareaModule } from 'primeng/primeng';
import { TableModule } from 'primeng/table';
import { CheckboxModule } from 'primeng/checkbox';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { DropdownModule } from 'primeng/dropdown';
import { FileUploadModule } from 'primeng/fileupload';

import { ImageCropperModule } from 'ngx-img-cropper';
import { DataCollectorComponent } from './data-collector/data-collector.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    SharedModule,
    AdminRoutingModule,
    TabViewModule,
    InputTextModule,
    ButtonModule,
    ToggleButtonModule,
    InputTextareaModule,
    DialogModule,
    TableModule,
    CheckboxModule,
    ScrollPanelModule,
    DropdownModule,
    ImageCropperModule,
    FileUploadModule
  ],
  declarations: [
    FeedbackListComponent,
    UserListComponent,
    OrganizationListComponent,
    DataCollectorComponent
  ]
})
export class AdminModule { }
