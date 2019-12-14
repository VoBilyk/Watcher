import { NgModule, Optional, SkipSelf } from '@angular/core';
import { throwIfAlreadyLoaded } from './guards/module-import.guard';
import { AuthService } from './services/auth.service';
import { TokenService } from './services/token.service';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { TokensInterceptor } from './interceptors/tokens-interceptor';
import { ToastrService } from './services/toastr.service';
import { SystemToastrService } from './services/system-toastr.service';
import { MessageService, ConfirmationService } from 'primeng/api';

import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { HomeGuard } from './guards/home.guard';
import { NotexistGuard } from './guards/notexist.guard';
import { ManagerGuard } from './guards/manager.guard';

import { ApiService } from './services/api.service';
import { FeedbackService } from './services/feedback.service';
import { ResponseService } from './services/response.service';
import { RoleService } from './services/role.service';
import { ChartService } from './services/chart.service';
import { UserOrganizationService } from './services/user-organization.service';
import { CollectedDataService } from './services/collected-data.service';
import { DataService } from './services/data.service';
import { DashboardService } from './services/dashboard.service';
import { ChatService } from './services/chat.service';
import { InstanceService } from './services/instance.service';
import { NotificationSettingsService } from './services/notification-settings.service';
import { NotificationService } from './services/notification.service';
import { OrganizationInvitesService } from './services/organization-invites.service';
import { OrganizationService } from './services/organization.service';
import { PathService } from './services/path.service';
import { UserService } from './services/user.service';
import { MessageService as InternalMessageService } from './services/message.service';

import { DashboardsHub} from './hubs/dashboards.hub';
import { ChatHub } from './hubs/chat.hub';
import { NotificationsHubService } from './hubs/notifications.hub';
import { OrganizationInvitesHub } from './hubs/organization-invites.hub';
import { OrganizationRoleService } from './services/organization-role.service';
import { CollectorAppsService } from './services/collector-apps.service';

@NgModule({
  imports: [
    HttpClientModule
  ],
  providers: [
    ApiService,
    AuthService,
    ChartService,
    ChatService,
    CollectedDataService,
    CollectorAppsService,
    DashboardService,
    DataService,
    FeedbackService,
    InstanceService,
    NotificationSettingsService,
    NotificationService,
    OrganizationInvitesService,
    OrganizationService,
    PathService,
    ResponseService,
    RoleService,
    OrganizationRoleService,
    SystemToastrService,
    ToastrService,
    TokenService,
    UserOrganizationService,
    UserService,
    InternalMessageService,
    ConfirmationService,
    MessageService,
    { provide: HTTP_INTERCEPTORS, useClass: TokensInterceptor, multi: true },

    AuthGuard,
    AdminGuard,
    HomeGuard,
    NotexistGuard,
    ManagerGuard,

    DashboardsHub,
    ChatHub,
    NotificationsHubService,
    OrganizationInvitesHub,
  ],

  declarations: []
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    throwIfAlreadyLoaded(parentModule, 'CoreModule');
  }
}
